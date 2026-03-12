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

interface Props {
	type?: string
	itemArr?: ChartItem[]
}

const props = withDefaults(defineProps<Props>(), {
	type: 'bar',
	itemArr: () => [],
})


const xData = computed(() => props.itemArr.map((i) => i.name))
const seriesData = computed(() => props.itemArr.map((i) => i.value))

const baseOption = computed(() => ({
	title: { text: '影片票房统计' },
	series: [
		{
			type: 'bar',
			barWidth: 46,
			label: { show: true, position: 'top', color: 'black' },
			itemStyle: { barBorderRadius: [5, 5, 0, 0] }
		}
	],

	tooltip: {
		trigger: 'axis',
		formatter: (params: any) =>
			`影片名：${params[0].name}<br />票房：${params[0].data}`,
		axisPointer: {
			show: true,
			type: 'line', // 指示器类型：线（垂直于x轴）
		}
	}
}))


</script>

<style lang="scss" scoped>
.common-echarts {
	width: 100%;
	height: 100%;
	min-height: 400px;
}
</style>

*** End Patch