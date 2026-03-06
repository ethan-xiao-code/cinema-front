<template>
  <!-- v-bind 可以解析父组件的其他props -->
  <div v-loading="loading" :element-loading-text="text" :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: "加载中..."
  }
})

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
</script>