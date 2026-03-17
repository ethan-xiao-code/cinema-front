<template>
  <div ref="chartRef" class="echart-container"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsOption, SeriesOption } from 'echarts'

export type SeriesDataType = (number | string | { value: number;[key: string]: any })[] | SeriesDataType[]

interface EChartProps {
  seriesData?: SeriesDataType
  xData?: any[]
  theme?: string | object
  baseOption?: any
}

const props = defineProps<EChartProps>()

const commonOptions: Partial<EChartsOption> = {
  grid: { top: '15%', left: '5%', right: '6%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    axisLabel: { interval: 0, inside: false },
    axisTick: {
      alignWithLabel: true, // 关键：让刻度线与标签居中对齐（必开）
      length: 8, // 刻度线长度（默认5px，可按需调整）
      show: false
    },
  },
  yAxis: { type: 'value', splitLine: { show: true }, axisLine: { show: true } },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      show: true,
      type: 'line', // 指示器类型：线（垂直于x轴）
      lineStyle: {
        type: 'dashed', // 核心：设为虚线
        color: '#666',  // 虚线颜色
        width: 1,       // 虚线宽度
      }
    }
  },
}

const { baseOption = {}, seriesData = [], xData = [] } = computed(() => ({ ...props })).value

const option = ref<EChartsOption>({ ...commonOptions, ...baseOption })

const buildSeries = (data: SeriesDataType): SeriesOption[] => {
  if (!data) return []
  // 支持传入单组或多组数据
  if (Array.isArray(data) && data.length > 0 && typeof data[0] !== 'object') {
    return [{ data: data as any }]
  }
  return (data as any[]).map((d) => ({ data: d }))
}

watch([
  () => props.baseOption,
  () => props.seriesData,
  () => props.xData
], () => {
  const merged = { ...commonOptions, ...(props.baseOption || {}) } as EChartsOption
  if (props.xData && props.xData.length) merged.xAxis = { ...merged.xAxis, data: props.xData }
  const series = buildSeries(props.seriesData || [])
  // 合并 baseOption.series 与 自动生成的 series，保持用户传入的 type/label 等配置
  const baseSeries = (props.baseOption && (props.baseOption.series as any[])) || []
  if (series.length) {
    merged.series = series.map((s, i) => ({ ...(baseSeries[i] || {}), ...s }))
  }
  option.value = merged
}, { immediate: true, deep: true })

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const resizeChart = () => {
  chartInstance && chartInstance.resize()
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value as HTMLDivElement, props.theme)
    chartInstance.setOption(option.value)
  }
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance && chartInstance.dispose()
})

watch(option, (o) => {
  chartInstance && chartInstance.setOption(o)
}, { deep: true })

defineExpose({ option })
</script>

<style scoped>
.echart-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
