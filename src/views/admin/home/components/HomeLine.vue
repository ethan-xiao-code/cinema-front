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

interface EchartsOption {
  title?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  [key: string]: any
}

interface Props {
  type?: string
  itemArr?: ChartItem[]
  echartsOption?: EchartsOption
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pie',
  itemArr: () => [],
  echartsOption: () => ({})
})

const xData = computed(() => props.itemArr.map((i) => i.name))
const seriesData = computed(() => props.itemArr.map((i) => i.value))

const baseOption = computed(() => ({
  title: { ...(props.echartsOption.title || {}), text: '每月售票量统计' },
  grid: props.echartsOption.grid,
  xAxis: props.echartsOption.xAxis,
  yAxis: props.echartsOption.yAxis,
  series: [ { type: 'line', label: { show: true, position: 'top', color: 'black' } } ],
  tooltip: { trigger: 'item', formatter: (params: any) => `月份：${params.name}<br />售票量：${params.data}` }
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