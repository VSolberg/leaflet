<template>
  <b-modal id="format-dialog" :title="title" centered hide-backdrop v-on:ok="emitOkEvent">
    <slot></slot>
  </b-modal>
</template>

<script>

export default {
  name: 'Dialog',
  props: {
    title: {
      type: String,
      required: true,
      default: ''
    }
  },
  methods: {
    emitOkEvent: function (event) {
      this.$emit('ok', event)
    }
  }
}

</script>