<template>
  <div id="editor-crumble">
    <div v-for="indx in length" :key="indx" class="line-container">
      <span class="float-right no-select">{{ indx }}&#10;</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'EditorCrumble',
  props: {
    length: {
      type: Number,
      required: true,
      default: 0
    }
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

#editor-crumble {
  display: inline-block;
  padding-right: 0.5rem;
  border-right: $container-border;
  white-space: pre;
}

.line-container {
  display: flex;
  justify-content: flex-end;
}

</style>