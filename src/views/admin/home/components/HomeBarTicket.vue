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
const endValue = ref(3)

const xData = computed(() => props.itemArr.map((i) => i.name))
const seriesData = computed(() => props.itemArr.map((i) => i.value))

const baseOption = computed(() => ({
	title: { ...(props.echartsOption.title || {}), text: '影片票房统计' },
	grid: props.echartsOption.grid,
	xAxis: props.echartsOption.xAxis,
	yAxis: props.echartsOption.yAxis,
	series: [ { type: 'bar', barWidth: 66, label: { show: true, position: 'top', color: 'black' }, itemStyle: { barBorderRadius: [5,5,0,0] } } ],
	tooltip: { trigger: 'item', formatter: (params: any) => `影片名：${params.name}<br />票房：${params.data}`, axisPointer: { type: 'shadow' } }
}))

let timer: any
const startInterval = () => {
	if (timer) clearInterval(timer)
	timer = setInterval(() => {
		startValue.value++
		endValue.value++
		if (endValue.value > props.itemArr.length - 1) {
			startValue.value = 0
			endValue.value = 3
		}
	}, 2000)
}

watch(() => props.itemArr, () => { startInterval() }, { immediate: true })

defineExpose({ startInterval })
</script>

<style lang="scss" scoped>
.common-echarts {
	width: 100%;
	height: 100%;
	min-height: 400px;
}
</style>

*** End Patch