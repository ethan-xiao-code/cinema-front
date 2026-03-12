<template>
  <div id="home">
    <!-- 查询条件 -->
    <el-form :inline="true" class="filter-bar" label-width="0">
      <div class="filter-bar-right">
        <!-- 影片名称 -->
        <el-form-item>
          <el-input v-model="params.filmName" placeholder="影片名称" clearable />
        </el-form-item>

        <el-form-item>
          <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" range-separator="至" />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button :loading="loading" type="primary" @click="qeuryChartData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </div>
    </el-form>

    <!-- 图表展示 -->
    <div class="echarts">
      <HomeBarTicket v-if="filmList.length" :itemArr="handleFilmList" />

      <HomeLine v-if="monthTicketList.length" :itemArr="handleMonthTicketList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFilmBoxOfficeApi, getMonthTicketApi } from '@/api/orders'
import HomeBarTicket from './components/HomeBarTicket.vue'
import HomeLine from './components/HomeLine.vue'
import { ChartParamsType } from '@/api/orders/type'
import dayjs from 'dayjs'
import { useRequest } from '@/utils/useRequest'

interface FilmBoxOfficeItem { id: number; filmName: string; boxOffice: number; type: string | number }
interface MonthTicketItem { date: string; ticketCount: number }
interface ChartItem { name: string; value: number }
const dateRange = ref<[string, string]>([
  dayjs().subtract(1, "month").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD")
])
const params = ref<ChartParamsType>({
  filmName: '',
  startTime: '2026-01',
  endTime: '2026-03'
})

const filmList = ref<FilmBoxOfficeItem[]>([])
const monthTicketList = ref<MonthTicketItem[]>([])
const handleFilmList = computed<ChartItem[]>(() =>
  filmList.value.map(i => ({ name: i.filmName, value: i.boxOffice }))
)

const handleMonthTicketList = computed<ChartItem[]>(() =>
  monthTicketList.value.map(i => ({ name: i.date, value: i.ticketCount }))
)

const getFilmBoxOffice = async (params: ChartParamsType) => {
  const res = await getFilmBoxOfficeApi({ ...params })
  return res
}

const getMonthTicket = async (params: ChartParamsType) => {
  const res = await getMonthTicketApi({ ...params })
  return res
}

const handleData = () => {
  const newParams = {...params.value}
  if (dateRange.value.length === 2) {
    newParams.startTime = dayjs(dateRange.value[0]).startOf('day').format("YYYY-MM-DD HH:mm:ss")
    newParams.endTime = dayjs(dateRange.value[1]).endOf('day').format("YYYY-MM-DD HH:mm:ss")
  }
  return Promise.all([getFilmBoxOffice(newParams), getMonthTicket(newParams)])
}

const { runFn: qeuryChartData,loading,startPolling } = useRequest(handleData, {
  onSuccess: (resList) => {
    const [res1, res2] = resList
    filmList.value = res1.map(item => {
      const { filmName } = item
      const newName = filmName.length > 10 ? filmName.slice(0, 10) + "..." : filmName
      return {
        ...item,
        filmName: newName
      }
    }) || []
    monthTicketList.value = res2 || []
  },
  throttleTime: 1000,
  intervalTime: 1000 * 60 * 5 // 每过5分钟就发一次接口请求
})

startPolling()

const resetFilters = () => {
  params.value = { filmName: '', startTime: undefined, endTime: undefined }
}

onMounted(() => { qeuryChartData() })
</script>

<style scoped lang="scss">
#home {
  width: 100%;
  padding: 10px;

  .filter-bar {
    width: 100%;

    .filter-bar-right {
      display: flex;
      justify-content: flex-end; // 右对齐
      gap: 12px; // 每个表单项间距
      flex-wrap: wrap; // 屏幕小了自动换行
    }

    .el-form-item {
      margin-right: 10px;
    }
  }

  .echarts {

    padding: 16px 0;
  }
}
</style>