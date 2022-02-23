<template>
  <b-sidebar id="explorer" title="Workspace" class="sidebar-size" shadow visible no-header-close>
    <div class="px-3 py-2">
      <span v-if="workspace === undefined" class="no-select">
        No workspace selected
      </span>
      <ExplorerFolder v-model="workspace" v-on:input="updateWorkspace" v-else/>
    </div>
  </b-sidebar>
</template>

<script>
import ExplorerFolder from "@/components/ExplorerFolder";
import { ipcRenderer } from "electron";

export default {
  name: 'Explorer',
  components: { ExplorerFolder },
  props: {
    workspace: {
      type: Object,
      required: false,
      default: undefined
    }
  },
  methods: {
    createWorkspaceTree: function (workspace) {
     return workspace
    },
    updateWorkspace: function () {
      ipcRenderer.send('workspace-changed', this.workspace)
    }
  },
  computed: {
    workspaceTree: function () {
      return this.createWorkspaceTree(this.workspace)
    }
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

#explorer {
  position: absolute;
  top: 2rem;
  min-height: 100vh;
  background-color: $container-bg;
  color: $container-color;
}

.sidebar-size {
  width: 20rem !important;
  height: 100% !important;
}

strong {
  -webkit-user-select: none;
}

</style>