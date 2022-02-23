<template>
  <div class="actions-container">
    <div class="search-field" :class="searchExpanded ? 'd-inline-block' : 'd-none'" v-on:focusout="toggleSearch">
      <input type="text" class="form-control-sm" v-model="searchQuery" v-on:input="debounceSearch" ref="query"/>
    </div>
    <div id="editor-actions" :class="searchExpanded ? 'border-tick' : ''">
      <SearchWebIcon class="action d-block" v-on:click="toggleSearch"/>
      <ChevronUpIcon class="action d-block" v-on:click="contentBeginEvent"/>
      <ChevronDownIcon class="action d-block" v-on:click="contentEndEvent"/>
    </div>
  </div>
</template>

<script>

import SearchWebIcon from 'vue-material-design-icons/SearchWeb.vue'
import ChevronUpIcon from 'vue-material-design-icons/ChevronUp.vue'
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue'
import _ from 'lodash'

export default {
  name: 'EditorActions',
  components: { SearchWebIcon, ChevronUpIcon, ChevronDownIcon },
  data () {
    return {
      searchQuery: '',
      searchExpanded: false,
      toggleLocked: false
    }
  },
  methods: {
    debounceSearch: _.debounce (function(e) {
      this.searchQuery = e.target.value
      this.$emit('search', this.searchQuery)
    }, 250),
    toggleSearch: function () {
      if(this.toggleLocked)
        return

      this.searchExpanded = !this.searchExpanded
      this.searchQuery = ''

      if (this.searchExpanded) {
        this.$nextTick(() => {
          this.$refs.query.focus()
        })
      }

      if(!this.searchExpanded) {
        this.$emit('search', this.searchQuery)
      }

      this.toggleLocked = true
      setTimeout(() => {
        this.toggleLocked = false
      }, 100)
    },
    contentBeginEvent: function () {
      this.$emit('begin')
    },
    contentEndEvent: function () {
      this.$emit('end')
    }
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

#editor-actions {
  background-color: $container-bg;
  padding: 0.2rem 0.2rem 0.4rem 0.2rem;
  border-radius: 5px;
  display: inline-block;
}

.actions-container {
  position: fixed;
  top: 3rem;
  right: 1rem;
}

.action {
  margin-top: 0.2rem;
  border-radius: 2px;
  cursor: pointer;
}

.action:hover {
  background-color: $highlight;
}

.search-field {
  position: relative;
  top: -2.88rem;
}

.search-field input {
  border-right: 0 !important;
}

.border-tick {
  border-radius: 0 5px 5px 5px !important;
}

</style>