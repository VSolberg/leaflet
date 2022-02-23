<template>
    <div class="clusterize">
      <EditorActions v-on:begin="scrollToTop" v-on:end="scrollToBottom" v-on:search="updateView"/>
      <table>
        <thead>
          <tr><th>content</th></tr>
        </thead>
      </table>
      <div id="scrollArea" class="clusterize-scroll" v-on:scroll="handleTailing">
        <table class="mx-auto">
          <tbody id="contentArea" class="clusterize-content">
            <tr class="clusterize-no-data mx-auto">
              <td><img src="assets/noresult.png" class="no-result"/></td>
            </tr>
            <tr class="clusterize-no-data mx-auto">
              <td><h3 style="color: #272c33;">Can't seem to find any logs</h3></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
</template>

<script>
import EditorActions from "@/components/EditorActions"
import { ipcRenderer } from "electron"

const Clusterize = require('clusterize.js');

export default {
  name: 'LogViewer',
  components: { EditorActions },
  data () {
    return {
      isTailing: true,
      filteredLogs: [],
      clusteredLogs: undefined,
      scrollElement: undefined,
      contentElement: undefined
    }
  },
  props: {
    content: {
      type: Array,
      required: true
    },
    pattern: {
      type: String,
      required: false,
      default: ''
    }
  },
  methods: {
    updateView: function (query) {
      const request = {
        filter: query,
        logs: this.content
      }

      ipcRenderer.invoke('filter-request', request).then(res => {
        if ((res === undefined || res.length <= 0) && this.clusteredLogs !== undefined) {
          this.clusteredLogs.clear()
          this.clusteredLogs.update()
          this.updateSplashScreen()
          return
        }

        if (this.clusteredLogs == null)
          return

        this.clusteredLogs.update(res.map((it, index) => '<tr><td class="line-counter no-select">' + (index + 1) + '</td><td class="log-line" tabindex="0">' + it + '</td></tr>'))

        if (this.isTailing)
          this.scrollToBottom()
      })
    },
    updateSplashScreen: function () {
      this.contentElement.innerHTML = "<tr class=\"clusterize-no-data mx-auto\"><td><img src=\"assets/noresult.png\" class=\"no-result\"/></td></tr><tr class=\"clusterize-no-data mx-auto\"><td><h3 style=\"color: #272c33;\">Can't seem to find any logs</h3></td></tr>"
    },
    scrollToBottom: function () {
      this.scrollElement.scrollTo(0, this.scrollElement.scrollHeight)
    },
    scrollToTop: function () {
      this.scrollElement.scrollTo(0, 0)
    },
    handleTailing: function () {
      this.isTailing = this.scrollElement.scrollHeight - this.scrollElement.scrollTop - window.innerHeight + 47 === 0
    }
  },
  watch: {
    content: function () {
      this.updateView()

      if (this.isTailing)
        this.scrollToBottom()
    }
  },
  mounted () {
    this.scrollElement = document.getElementById("scrollArea")
    this.contentElement = document.getElementById("contentArea")

    this.clusteredLogs = new Clusterize({
      scrollId: 'scrollArea',
      contentId: 'contentArea',
      no_data_class: 'clusterize-no-data',
      show_no_data_row: false
    })

    this.updateView('')
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

.clusterize {
  margin-top: 1vh;
}

.log-line {
  padding-right: 2rem;
  padding-left: 0.5rem;
}

.log-line:focus {
  background-color: rgb(42, 47, 54);
}

.line-counter {
  position: sticky;
  left: 0;
  background-color: $body-bg;
  box-shadow: 0 0 1px rgba(128, 128, 128, 1);
}

.no-result {
  margin-top: 15vh;
  width: 450px;
  height: auto;
}

.query-match {
  background-color: $search-highlight;
  display: inline-block;
  border-radius: 3px;
}

</style>