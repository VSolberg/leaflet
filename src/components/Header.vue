<template>
  <div id="header">
    <b-img src="/assets/icon.png" class="favicon d-inline-block header-item"/>
    <HeaderButton title="File">
      <b-dropdown-item v-on:click="selectWorkspace">Open workspace</b-dropdown-item>
      <b-dropdown-item v-on:click="closeWorkspace" :class="!isWorkspaceSelected ? 'inactive disabled' : ''" :disabled="!isWorkspaceSelected">Close workspace</b-dropdown-item>
      <b-dropdown-item v-on:click="closeApplication">Exit</b-dropdown-item>
    </HeaderButton>
<!--    <HeaderButton title="View">-->
<!--      <b-dropdown-item v-on:click="$bvModal.show('format-dialog')">Apply formatting</b-dropdown-item>-->
<!--    </HeaderButton>-->
    <Dialog title="Apply logging pattern" v-on:ok="applyLoggingFormat">
      <span>Logging pattern to be used when parsing logs</span>
      <input type="text" class="form-control mt-2" v-model="logPattern"/>
    </Dialog>
    <span class="d-inline-block header-paragraph header-title">Leaflet - {{ activeFileName }}</span>
    <div class="d-inline-block float-right">
      <div class="d-inline-block titlebar-button" v-on:click="developerMode" v-if="developerModeActivated">
        <DeveloperBoardIcon class="mx-3 align-middle"/>
      </div>
      <div class="d-inline-block titlebar-button" v-on:click="minimizeWindow">
        <MinusIcon class="mx-3 align-middle"/>
      </div>
      <div class="d-inline-block titlebar-button" v-on:click="maximizeWindow">
        <FlipToFrontIcon class="mx-3 align-middle"/>
      </div>
      <div class="d-inline-block titlebar-button" v-on:click="closeWindow">
        <CloseIcon class="mx-3 align-middle"/>
      </div>
    </div>
  </div>
</template>

<script>
import MinusIcon from 'vue-material-design-icons/Minus.vue';
import FlipToFrontIcon from 'vue-material-design-icons/FlipToFront.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DeveloperBoardIcon from 'vue-material-design-icons/DeveloperBoard.vue';
import HeaderButton from "@/components/HeaderButton";
import { ipcRenderer } from 'electron'
import Dialog from "@/components/Dialog";

export default {
  name: 'Header',
  components: {
    Dialog,
    MinusIcon,
    FlipToFrontIcon,
    CloseIcon,
    DeveloperBoardIcon,
    HeaderButton
  },
  data () {
    return {
      logPattern: '',
      developerModeActivated: false
    }
  },
  props: {
    activeFileName: {
      type: String,
      required: false,
      default: 'No file selected'
    },
    isWorkspaceSelected: {
      type: Boolean,
      required: false,
      default: false
    },
    initialPattern: {
      type: String,
      required: false,
      default: ''
    }
  },
  methods: {
    closeWindow: function () {
      ipcRenderer.send('close')
    },
    minimizeWindow: function () {
      ipcRenderer.send('minimize')
    },
    maximizeWindow: function () {
      ipcRenderer.send('maximize')
    },
    developerMode: function () {
      ipcRenderer.send('devtools')
    },
    selectWorkspace: function () {
      ipcRenderer.send('select-workspace')
    },
    closeWorkspace: function () {
      if (this.isWorkspaceSelected)
        ipcRenderer.send('close-workspace')
    },
    closeApplication: function () {
      ipcRenderer.send('close')
    },
    applyLoggingFormat: function () {
      this.$emit('pattern-changed', this.logPattern)
    }
  },
  mounted () {
    this.developerModeActivated = window.webpackHotUpdate !== undefined
    this.logPattern = this.initialPattern
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

#header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: $container-bg;
  color: $container-color;
  border-bottom: 1px solid rgba(128, 128, 128, 0.20);
  z-index: 3000;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.titlebar-button {
  -webkit-app-region: no-drag;
  cursor: pointer;
}

.header-item {
  margin-top: 0.1rem;
  margin-right: 1rem;
}

.favicon {
  margin-left: 0.5rem;
  max-width: 1.2rem;
  height: auto;
}

.header-paragraph {
  vertical-align: middle;
  text-align: left;
  line-height: 1.8rem;
  font-size: 0.9rem;
  cursor: default;
}

.header-title {
  color: $window-title-color;
  margin-left: 14.75rem;
}

.inactive a {
  color: $window-title-color;
  cursor: default;
}

.inactive a:hover {
  background-color: inherit !important;
}

</style>