<template>
  <EchartsCommon :baseOption="baseOption" :seriesData="seriesData" :xData="xData" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  type: 'bar',
  itemArr: () => [],
  echartsOption: () => ({})
})

const startValue = ref(0)

const xData = computed(() => {
  const arr = props.itemArr.slice(startValue.value * 4, startValue.value * 4 + 4)
  return arr.map((i) => i.name)
})

const seriesData = computed(() => {
  const arr = props.itemArr.slice(startValue.value * 4, startValue.value * 4 + 4)
  return arr.map((i) => i.value)
})

const baseOption = computed(() => ({
  title: { ...(props.echartsOption.title || {}), text: '每月销售额统计' },
  grid: props.echartsOption.grid,
  xAxis: props.echartsOption.yAxis,
  yAxis: props.echartsOption.xAxis,
  series: [ { type: 'bar', barWidth: 66, label: { show: true, position: 'right', color: 'black' }, itemStyle: { barBorderRadius: [5,5,0,0] } } ],
  tooltip: { trigger: 'item', formatter: (params: any) => `月份：${params.name}<br />金额：${params.data}元`, axisPointer: { type: 'shadow' } }
}))

let timer: any
const startInterval = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    startValue.value++
    if (startValue.value * 4 >= props.itemArr.length) startValue.value = 0
  }, 3000)
}

watch(() => props.itemArr, () => {
  startInterval()
}, { immediate: true })

defineExpose({ startInterval })
</script>

<style lang="scss" scoped>
.common-echarts {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>