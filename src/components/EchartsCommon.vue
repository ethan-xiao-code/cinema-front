<template>
  <v-chart :option="option" autoresize :style="{ width, height }" class="echart-container" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption, SeriesOption } from 'echarts'

export type SeriesDataType = (number | string | { value: number; [key: string]: any })[] | SeriesDataType[]

interface EChartProps {
  width?: string
  height?: string
  seriesData?: SeriesDataType
  xData?: any[]
  theme?: string | object
  baseOption?: EChartsOption
}

const props = defineProps<EChartProps>()

const defaultProps: Required<Pick<EChartProps, 'width' | 'height' | 'theme'>> = {
  width: '100%',
  height: '400px',
  theme: 'default'
}

const commonOptions: Partial<EChartsOption> = {
  tooltip: { trigger: 'axis' },
  grid: { top: '12%', left: '5%', right: '6%', bottom: '6%', containLabel: true }
}

const { width, height, baseOption = {}, seriesData = [], xData = [] } = computed(() => ({ ...defaultProps, ...props })).value

const option = ref<EChartsOption>({ ...commonOptions, ...baseOption })

const buildSeries = (data: SeriesDataType): SeriesOption[] => {
  if (!data) return []
  // 支持传入单组或多组数据
  if (Array.isArray(data) && data.length > 0 && typeof data[0] !== 'object') {
    return [ { data: data as any } ]
  }
  return (data as any[]).map((d) => ({ data: d }))
}

watch([
  () => props.baseOption,
  () => props.seriesData,
  () => props.xData
], () => {
  const merged = { ...commonOptions, ...(props.baseOption || {}) } as EChartsOption
  if (props.xData && props.xData.length) merged.xAxis = { data: props.xData }
  const series = buildSeries(props.seriesData || [])
  // 合并 baseOption.series 与 自动生成的 series，保持用户传入的 type/label 等配置
  const baseSeries = (props.baseOption && (props.baseOption.series as any[])) || []
  if (series.length) {
    merged.series = series.map((s, i) => ({ ...(baseSeries[i] || {}), ...s }))
  }
  option.value = merged
}, { immediate: true, deep: true })

defineExpose({ option })
</script>

<style scoped>
.echart-container {
  min-width: 100px;
  min-height: 100px;
}
</style>