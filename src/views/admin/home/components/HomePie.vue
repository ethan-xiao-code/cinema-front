<template>
  <EchartsCommon :baseOption="baseOption" :seriesData="seriesData" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EchartsCommon from '@/components/EchartsCommon.vue'

interface PieItem {
  name: string
  value: number
}

interface Props {
  type?: string
  itemArr?: PieItem[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pie',
  itemArr: () => []
})

const seriesData = computed(() => props.itemArr)

const baseOption = computed(() => ({
  title: { text: '不同类型影片票房占比', textStyle: { fontSize: 30, color: 'black' }, left: 20, top: 20 },
  tooltip: { trigger: 'item', formatter: (params: any) => `${params.name}: ${params.value} (${params.percent}%)` },
  legend: { orient: 'vertical', left: 'right', padding: 20 },
  series: [ { name: '', type: 'pie', radius: '60%', top: '40', emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }, label: { show: true, formatter: (data: any) => `${data.name} ${data.value}\n(${data.percent.toFixed(1)}%)` } } ]
}))

defineExpose({})
</script>

<style lang="scss" scoped>
.common-echarts {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>