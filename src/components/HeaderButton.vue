<template>
  <b-dropdown class="titlebar-button d-inline-block dropdown" size="sm" variant="link" :class="{show: isOpen, highlighted: isOpen}" no-caret>
    <template #button-content>
      <span v-on:mouseover="isOpen = true" v-on:mouseleave="isOpen = false">{{ title }}</span>
    </template>
    <slot/>
  </b-dropdown>
</template>

<script>

export default {
  name: 'HeaderButton',
  data () {
    return {
      isOpen: false,
      isHighlighted: false
    }
  },
  props: {
    title: {
      type: String,
      required: true,
      default: ''
    },
  }
}

</script>

<style lang="scss">

@import 'src/assets/style/variables.scss';

.highlighted {
  background-color: $highlight !important;
}

</style>