<template>
  <BaseLoading :loading="loading" text="票房数据加载中..." id="home">
    <!-- 查询条件 -->
    <el-form :model="params" :inline="true" class="filter-bar" label-width="0">
      <div class="filter-bar-right">
        <!-- 影片名称 -->
        <el-form-item>
          <el-input
            v-model="params.filmName"
            placeholder="影片名称"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-date-picker
            :clearable="false"
            v-model="dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="至"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button :loading="loading" type="primary" @click="qeuryChartData"
            >查询</el-button
          >
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </div>
    </el-form>

    <!-- 核心指标卡片 -->
    <div
      class="kpi-cards"
      v-if="filmBoxOfficeRank.length && dayBoxOfficeList.length"
    >
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">区间总票房 (元)</div>
        <div class="kpi-value highlight">
          {{ statisticObj.totalBoxOffice.toLocaleString() }}
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">区间总售票 (张)</div>
        <div class="kpi-value">
          {{ statisticObj.totalTickets.toLocaleString() }}
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">日均票房 (元)</div>
        <div class="kpi-value">
          {{ statisticObj.dailyAverageBoxOffice.toLocaleString() }}
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="kpi-title">日均售票 (张)</div>
        <div class="kpi-value">
          {{ statisticObj.dailyAverageTickets.toLocaleString() }}
        </div>
      </el-card>
    </div>

    <!-- 图表展示 -->
    <div
      class="echarts"
      v-if="filmBoxOfficeRank.length && dayBoxOfficeList.length"
    >
      <div class="chart-container">
        <BoxOfficeRankBar :itemArr="handleFilmList" />
      </div>
      <div class="chart-container top0">
        <BoxOfficeTrendLine :itemArr="handleMonthTicketList" />
        <!-- 提示：若后端提供每日销售额API(如 getDailyRevenueApi )，可在此并排展示销售额趋势图 -->
      </div>
    </div>
    <el-empty
      v-else
      :image-size="250"
      description="暂无数据，请更换查询条件~"
    />
  </BaseLoading>
</template>

<script setup lang="ts">
import { ref, computed, onMounted,onActivated } from "vue";
import { useRoute } from "vue-router";
import {
  getFilmBoxOfficeTrendApi,
  getDayBoxOfficeApi,
  getStatisticsBoxOfficeApi
} from "@/api/orders";
import BoxOfficeTrendLine from "./components/BoxOfficeTrendLine.vue";
import BaseLoading from "@/components/BaseLoading.vue";
import BoxOfficeRankBar from "./components/BoxOfficeRankBar.vue";
import {
  ChartParamsType,
  FilmBoxOfficeType,
  BoxOfficeTrendType,
  ChartItemType,
  StatisticsBoxOfficeType,
} from "@/api/orders/type";
import dayjs, { Dayjs } from "dayjs";
import { useRequest } from "@/utils/useRequest";
defineOptions({
  name: "adminDataBoard",
});

const route = useRoute();

const initDateRange: [string, string] = [
  dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  dayjs().subtract(1, "day").format("YYYY-MM-DD"),
];
const dateRange = ref<[string, string]>(initDateRange);
const params = ref<ChartParamsType>({
  filmName: "",
  startTime: "",
  endTime: "",
});

const statisticObj = ref<StatisticsBoxOfficeType>({
  totalBoxOffice: 0,
  totalTickets: 0,
  dailyAverageBoxOffice: 0,
  dailyAverageTickets: 0,
});

const filmBoxOfficeRank = ref<FilmBoxOfficeType[]>([]); // 影片票房排行
const dayBoxOfficeList = ref<BoxOfficeTrendType[]>([]); // 日票房
const handleFilmList = computed<ChartItemType[]>(() =>
  filmBoxOfficeRank.value.map((i) => ({
    name: i.filmName,
    value: i.boxOffice,
  })),
);

const handleMonthTicketList = computed<ChartItemType[]>(() =>
  dayBoxOfficeList.value.map((i) => ({ name: i.date, value: i.dayBoxOffice })),
);


const getFilmBoxOffice = async (params: ChartParamsType) => {
  const res = await getFilmBoxOfficeTrendApi({ ...params });
  return res;
};

const getMonthTicket = async (params: ChartParamsType) => {
  const res = await getDayBoxOfficeApi({ ...params });
  return res;
};

const getStatisticsBoxOffice = async (params: ChartParamsType) => {
  const res = await getStatisticsBoxOfficeApi({ ...params });
  return res;
};


const handleData = () => {
  const newParams = { ...params.value };
  if (dateRange.value.length === 2) {
    newParams.startTime = dayjs(dateRange.value[0])
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    newParams.endTime = dayjs(dateRange.value[1])
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
  }
  return Promise.all([
    getFilmBoxOffice(newParams),
    getMonthTicket(newParams),
    getStatisticsBoxOffice(newParams)
  ]);
};

const fillMissingDates = (
  data: BoxOfficeTrendType[],
  startDate: string,
  endDate: string,
) => {
  const result = [];
  const dataMap = new Map();

  // 将原有数据存入Map，便于快速查找
  data.forEach((item) => {
    dataMap.set(item.date, item.dayBoxOffice);
  });

  // 生成日期范围内的每一天
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0]; // 格式化为 YYYY-MM-DD
    result.push({
      date: dateStr,
      dayBoxOffice: dataMap.has(dateStr) ? dataMap.get(dateStr) : 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

const {
  runFn: qeuryChartData,
  loading,
  startPolling,
} = useRequest(handleData, {
  onSuccess: (resList) => {
    const [res1, res2,res3] = resList;
    statisticObj.value = res3
    filmBoxOfficeRank.value = res1.sort((a, b) => b.boxOffice - a.boxOffice);
    dayBoxOfficeList.value = 
      fillMissingDates(res2, dateRange.value[0], dateRange.value[1]) || [];
  },
  throttleTime: 1000,
  intervalTime: 1000 * 60 * 5, // 每过5分钟就发一次接口请求
});

startPolling();

const resetFilters = () => {
  params.value = { filmName: "", startTime: undefined, endTime: undefined };
  dateRange.value = initDateRange;
  qeuryChartData();
};

onActivated(() => {
  // 每次进入页面都会执行（包括缓存恢复）
  if (route.query.startTime && route.query.endTime) {
    dateRange.value = [
      route.query.startTime as string,
      route.query.endTime as string,
    ];
  }

  if (route.query.filmName) {
    params.value.filmName = route.query.filmName as string;
  }

  qeuryChartData();
});

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
      padding: 30px 20px;
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
    .top0 {
      padding-top: 0;
    }
  }
}
</style>
