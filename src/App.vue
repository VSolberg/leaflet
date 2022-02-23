<template>
  <div id="app">
    <b-row>
      <b-col>
        <Header v-on:pattern-changed="setLogPattern" :active-file-name="activeFileName" :is-workspace-selected="workspace !== undefined" :initial-pattern="logPattern"/>
      </b-col>
    </b-row>
    <b-row class="mx-0">
      <div class="board-container">
        <div class="sidebar-container">
          <Explorer :workspace="workspace"/>
        </div>
        <div class="viewer-container">
          <LogViewer :content="logFileContent" :pattern="logPattern"/>
        </div>
      </div>
    </b-row>
  </div>
</template>

<script>
import Explorer from "@/components/Explorer";
import Header from "@/components/Header";
import LogViewer from "@/components/LogViewer";
import {ipcRenderer} from "electron";
import StateService from "@/service/StateService";

export default {
  name: 'App',
  data () {
    return {
      workspace: undefined,
      logFileContent: [],
      logPattern: '',
      activeFileName: 'No file selected'
    }
  },
  components: {
    Header,
    Explorer,
    LogViewer
  },
  methods: {
    setupInterProcessCalls: function () {
      let self = this

      ipcRenderer.on('selected-workspace', (event, workspace) => {
        self.workspace = workspace
      })

      ipcRenderer.on('log-update', (event, response) => {
        this.activeFileName = response.filename
        console.log(response.filename)
        this.logFileContent = this.logFileContent.concat(response.payload)
      })

      ipcRenderer.on('clear-log', () => {
        this.logFileContent = []
      })

      ipcRenderer.on('close-workspace', () => {
        this.activeFileName = 'No file selected'
        this.workspace = undefined;
        this.logPattern = ''
      })
    },
    loadActiveState: function () {
      const activeWorkspace = StateService.getWorkspace()
      const activeLogFile = StateService.getActiveLogFile()
      const activeLogPattern = StateService.getLogPattern()

      if (activeWorkspace !== undefined) {
        ipcRenderer.send('load-workspace', activeWorkspace)
      }

      if (activeLogFile !== undefined) {
        this.activeFileName = activeLogFile.name
        ipcRenderer.send('selected-log', activeLogFile)
      }

      if (activeLogPattern !== undefined) {
        this.logPattern = activeLogPattern
      }
    },
    setLogPattern: function (pattern) {
      StateService.setLogPattern(pattern)
      this.logPattern = pattern
    }
  },
  created () {
    this.setupInterProcessCalls()
    this.loadActiveState()
  }
}
</script>

<style>

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app::-webkit-scrollbar {
  display: none;
}

.board-container {
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-container {
  width: 21rem !important;
  height: 100vh !important;
  display: inline-block;
}

.viewer-container {
  width: calc(100vw - 21rem);
  display: inline-block;
  vertical-align: top;
}

</style>
