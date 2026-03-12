<template>
  <EchartsCommon :baseOption="baseOption" :seriesData="seriesData" :xData="xData" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import EchartsCommon from '@/components/EchartsCommon.vue'

interface ChartItem {
  name: string
  value: number
}


interface Props {
  type?: string
  itemArr?: ChartItem[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pie',
  itemArr: () => [],
  echartsOption: () => ({})
})

const xData = computed(() => props.itemArr.map((i) => i.name))
const seriesData = computed(() => props.itemArr.map((i) => i.value))

const baseOption = computed(() => ({
  title: { text: '每月售票量统计' },
  series: [ { type: 'line', label: { show: true, position: 'top', color: 'black' } } ],
  tooltip: { trigger: 'axis', formatter: (params: any) => `日期：${params[0].name}<br />售票量：${params[0].data}` }
}))

watch(() => props.itemArr, () => {}, { deep: true })

defineExpose({})
</script>

<style lang="scss" scoped>
.common-echarts {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>