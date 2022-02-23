<template>
  <div class="row">
    <div class="col">
      <div class="folder" :style="spacing">
        <template v-if="folder.isFolder">
          <ChevronRightIcon class="icon" v-if="!folder.isExpanded" v-on:click="toggleExpansion"/>
          <ChevronDownIcon class="icon" v-else v-on:click="toggleExpansion"/>
          <FolderIcon class="icon" v-on:dblclick="handleEntrySelected"/>
        </template>
        <FileDocumentIcon class="icon" v-else v-on:dblclick="handleEntrySelected"/>
        <p class="folder-name no-select" v-on:dblclick="handleEntrySelected">{{ folder.name }}</p>
        <template v-if="folder.isExpanded">
          <ExplorerFolder v-for="(_, indx) in folder.children" :key="indx" v-model="folder.children[indx]" v-on:input="folderUpdated" :level="level + 1"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue'
import FolderIcon from 'vue-material-design-icons/Folder.vue'
import FileDocumentIcon from 'vue-material-design-icons/FileDocument.vue'
import { ipcRenderer } from 'electron'

export default {
  name: 'ExplorerFolder',
  components: { ChevronRightIcon, ChevronDownIcon, FolderIcon, FileDocumentIcon },
  data () {
    return {
      folder: this.value
    }
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      required: false,
      default: 0
    }
  },
  methods: {
    handleEntrySelected: function () {
      if (this.folder.isFolder) {
        this.toggleExpansion()
      } else {
        ipcRenderer.send('selected-log', this.folder)
      }
    },
    toggleExpansion: function () {
      this.folder.isExpanded = !this.folder.isExpanded
      this.$emit('input', this.folder)
    },
    folderUpdated: function () {
      this.$emit('input', this.folder)
    }
  },
  computed: {
    spacing: function () {
      if (this.level === 0 && this.folder.isFolder)
        return ""
      else if (this.level !== 0 && !this.folder.isFolder)
        return "margin-left: 2rem;"
      else return "margin-left: 1rem;"
    }
  }
}

</script>

<style>
.folder {
  display: inline-block;
}

.folder-name {
  padding: 0 0.25rem 0 0;
  margin: 0 0 0 0.25rem;
  font-size: 0.7rem;
  line-height: normal;
  display: inline-block;
  vertical-align: middle;
  cursor: default;
}

.icon {
  font-size: 1rem;
  vertical-align: middle;
}
</style>