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
          <el-date-picker :clearable="false" v-model="dateRange" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" range-separator="至" />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button :loading="loading" type="primary" @click="qeuryChartData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </div>
    </el-form>

    <!-- 核心指标卡片 -->
    <div class="kpi-cards" v-if="filmList.length && monthTicketList.length">
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">区间总票房 (元)</div>
        <div class="kpi-value highlight">{{ totalBoxOffice.toLocaleString() }}</div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">区间总售票 (张)</div>
        <div class="kpi-value">{{ totalTickets.toLocaleString() }}</div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">日均票房 (元)</div>
        <div class="kpi-value">{{ dailyAverageBoxOffice.toLocaleString() }}</div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">日均售票 (张)</div>
        <div class="kpi-value">{{ dailyAverageTickets.toLocaleString() }}</div>
      </el-card>
    </div>

    <!-- 图表展示 -->
    <div class="echarts" v-if="filmList.length && monthTicketList.length">
      <div class="chart-container">
        <h3 class="chart-title">影片票房排行分布</h3>
        <HomeBarTicket :itemArr="handleFilmList" />
      </div>
      <div class="chart-container">
        <h3 class="chart-title">每日售票量/销售额走势</h3>
        <HomeLine :itemArr="handleMonthTicketList" />
        <!-- 提示：若后端提供每日销售额API(如 getDailyRevenueApi )，可在此并排展示销售额趋势图 -->
      </div>
    </div>
    <el-empty v-else :image-size="250" description="暂无数据，请更换查询条件~" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFilmBoxOfficeApi, getMonthTicketApi /*, getDailyRevenueApi */ } from '@/api/orders'
import HomeBarTicket from './components/HomeBarTicket.vue'
import HomeLine from './components/HomeLine.vue'
import { ChartParamsType } from '@/api/orders/type'
import dayjs from 'dayjs'
import { useRequest } from '@/utils/useRequest'
defineOptions({
  name: 'adminDataBoard'
})

const route = useRoute()
interface FilmBoxOfficeItem { id: number; filmName: string; boxOffice: number; type: string | number }
interface MonthTicketItem { date: string; ticketCount: number }
interface ChartItem { name: string; value: number }
const dateRange = ref<[string, string]>([
  dayjs().subtract(1, "month").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD")
])
const params = ref<ChartParamsType>({
  filmName: '',
  startTime: '',
  endTime: ''
})

const filmList = ref<FilmBoxOfficeItem[]>([])
const monthTicketList = ref<MonthTicketItem[]>([])
const handleFilmList = computed<ChartItem[]>(() =>
  filmList.value.map(i => ({ name: i.filmName, value: i.boxOffice }))
)

const handleMonthTicketList = computed<ChartItem[]>(() =>
  monthTicketList.value.map(i => ({ name: i.date, value: i.ticketCount }))
)

// KPI 计算属性
const totalBoxOffice = computed(() => {
  return filmList.value.reduce((sum, item) => sum + item.boxOffice, 0)
})
const totalTickets = computed(() => {
  return monthTicketList.value.reduce((sum, item) => sum + item.ticketCount, 0)
})
const dailyAverageBoxOffice = computed(() => {
  return monthTicketList.value.length ? Math.round(totalBoxOffice.value / monthTicketList.value.length) : 0
})
const dailyAverageTickets = computed(() => {
  return monthTicketList.value.length ? Math.round(totalTickets.value / monthTicketList.value.length) : 0
})

const getFilmBoxOffice = async (params: ChartParamsType) => {
  const res = await getFilmBoxOfficeApi({ ...params })
  return res
}

const getMonthTicket = async (params: ChartParamsType) => {
  const res = await getMonthTicketApi({ ...params })
  return res
}

// 预留模拟获取每日销售额数据 (如需真实数据请解开注释并结合后端API)
// const getDailyRevenue = async (params: ChartParamsType) => {
//   const res = await getDailyRevenueApi({ ...params })
//   return res
// }

const handleData = () => {
  const newParams = { ...params.value }
  if (dateRange.value.length === 2) {
    newParams.startTime = dayjs(dateRange.value[0]).startOf('day').format("YYYY-MM-DD HH:mm:ss")
    newParams.endTime = dayjs(dateRange.value[1]).endOf('day').format("YYYY-MM-DD HH:mm:ss")
  }
  return Promise.all([getFilmBoxOffice(newParams), getMonthTicket(newParams) /*, getDailyRevenue(newParams) */])
}

const { runFn: qeuryChartData, loading, startPolling } = useRequest(handleData, {
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
  dateRange.value = [
    dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD")
  ]
  qeuryChartData()
}

onMounted(() => { 
  // 接收从其他页面跳转携带来的参数并应用筛选
  if (route.query.startTime && route.query.endTime) {
    dateRange.value = [route.query.startTime as string, route.query.endTime as string]
  }
  if (route.query.filmName) {
    params.value.filmName = route.query.filmName as string
  }
  qeuryChartData() 
})
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

.kpi-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  .kpi-card {
    flex: 1;
    text-align: center;
    border-radius: 8px;
    
    .kpi-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }
    
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      
      &.highlight {
        color: #e53e3e;
      }
    }
  }
}

  .echarts {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
  
  .chart-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .chart-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #303133;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }
  }
}
</style>