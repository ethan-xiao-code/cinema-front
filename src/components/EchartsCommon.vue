<template>
  <div ref="chartRef" class="echart-container"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { EChartsOption, SeriesOption } from 'echarts'
import echarts from '@/plugins/echarts';
export type SeriesDataType = (number | string | { value: number;[key: string]: any })[] | SeriesDataType[]

interface EChartProps {
  seriesData?: SeriesDataType
  xData?: any[]
  theme?: string | object
  baseOption?: any
}

const props = defineProps<EChartProps>()

const commonOptions: Partial<EChartsOption> = {
  grid: {  top: 50,left: 20, right: 20, bottom: 45, containLabel: true },
  xAxis: {
    type: 'category',
    axisLabel: {  inside: false },
    axisTick: {
      alignWithLabel: true,
      length: 8,
      show: false
    },
  },
  yAxis: { type: 'value', splitLine: { show: true }, axisLine: { show: true } },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      show: true,
      type: 'line',
      lineStyle: {
        type: 'dashed',
        color: '#666',
        width: 1,
      }
    }
  },
  dataZoom: [
    {
      type: "slider",
      show: true,
      start: 0,
      end: 100,
      bottom: 10,
      height: 25,
    },
  ],
}

const { baseOption = {}, seriesData = [], xData = [] } = computed(() => ({ ...props })).value

const option = ref<EChartsOption>({ ...commonOptions, ...baseOption })

const buildSeries = (data: SeriesDataType): SeriesOption[] => {
  if (!data) return []
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
  const baseSeries = (props.baseOption && (props.baseOption.series as any[])) || []
  if (series.length) {
    merged.series = series.map((s, i) => ({ ...(baseSeries[i] || {}), ...s }))
  }
  option.value = merged
}, { immediate: true, deep: true })

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value as HTMLDivElement, props.theme)
    chartInstance.setOption(option.value)

    // 监听容器尺寸变化
    resizeObserver = new ResizeObserver(() => {
      chartInstance && chartInstance.resize()
    })

    resizeObserver.observe(chartRef.value)
  }
})

onBeforeUnmount(() => {
  // 清理 observer
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
    resizeObserver.disconnect()
  }

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
