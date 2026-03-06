<template>
  <div id="home">
    <div class="echarts">
      <!-- 展示每部影片的票房 -->
      <HomeBarTicket 
        v-if="filmList.length" 
        :itemArr="handleFilmList" 
        :echartsOption="echartsOption"
      />
      <!-- 展示每个月的销量 -->
      <!-- <HomeLine 
        v-if="monthTicketList.length" 
        :echartsOption="echartsOption" 
        :itemArr="handleMonthTicketList"
      /> -->
      <!-- 展示不同类型的影片的票房数
      <HomePie 
        v-if="boxOfficeList.length" 
        :itemArr="handleBoxOfficeList"
      /> -->
      <!-- 展示每月金额 -->
      <!-- <HomeBarAmount 
        v-if="amountList.length" 
        :itemArr="handleMonthAmountList" 
        :echartsOption="echartsOption"
      /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// 导入API
import { getFilmBoxOfficeApi, getMonthTicketApi, getMonthAmountApi } from "@/api/orders";
import { getBoxOfficeByTypeApi } from "@/api/film";
// 导入组件
import HomeBarTicket from "./components/HomeBarTicket.vue";
import HomePie from "./components/HomePie.vue";
import HomeLine from "./components/HomeLine.vue";
import HomeBarAmount from "./components/HomeBarAmount.vue";
// 导入常量
import { filmTypeList } from "@/utils/constant";

// ================ 1. 定义类型接口（核心优化：TypeScript类型安全） ================
/** 影片票房数据类型 */
interface FilmBoxOfficeItem {
  name: string;
  boxOffice: number;
}

/** 月度票房数据类型 */
interface MonthTicketItem {
  month: string; // 格式如 "2026-02"
  ticketCount: number;
}

/** 按类型统计票房数据类型 */
interface BoxOfficeByTypeItem {
  type: string | number;
  totalBoxOffice: number;
}

/** 月度金额数据类型 */
interface MonthAmountItem {
  month: string; // 格式如 "2026-02"
  totalAmount: number;
}

/** 图表项通用类型 */
interface ChartItem {
  name: string;
  value: number;
}

defineOptions({
  name: 'adminHome'
})

// ================ 2. 常量定义（核心优化：硬编码抽离） ================
/** 票房/销量放大倍数（统一维护） */
const DATA_SCALE_MULTIPLE = 100;
/** 图表网格布局尺寸（统一维护） */
const CHART_GRID_SIZE = 550;
const CHART_GRID_GAP = 40;

// ================ 3. 响应式数据（核心优化：明确类型） ================
const filmList = ref<FilmBoxOfficeItem[]>([]);
const monthTicketList = ref<MonthTicketItem[]>([]);
const boxOfficeList = ref<BoxOfficeByTypeItem[]>([]);
const amountList = ref<MonthAmountItem[]>([]);

// ================ 4. 图表配置（核心优化：非响应式改为常量） ================
// 静态配置无需响应式，减少Vue响应式开销
const echartsOption = {
  title: {
    textStyle: {
      fontSize: 30,
      color: "black",
    },
    left: 20,
    top: 20,
  },
  grid: {
    top: "20%",
    left: "5%",
    right: "6%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: true,
      interval: 0,
    },
  },
  yAxis: {
    type: "value",
    splitLine: {
      show: true,
    },
    axisLine: {
      show: true,
    },
  },
} as const;

// ================ 5. 通用工具函数（核心优化：代码复用） ================
/**
 * 格式化月份（如 "2026-02" → "2月"）
 * @param monthStr 月份字符串（格式：YYYY-MM）
 * @returns 格式化后的月份
 */
const formatMonth = (monthStr: string): string => {
  const month = monthStr.split("-")[1];
  return month ? `${Number(month)}月` : "未知月份";
};

// ================ 6. 计算属性（核心优化：命名规范 + 类型明确） ================
const handleFilmList = computed<ChartItem[]>(() => {
  return filmList.value.map((item) => ({
    name: item.filmName,
    value: item.boxOffice * DATA_SCALE_MULTIPLE,
  }));
});

const handleMonthTicketList = computed<ChartItem[]>(() => {
  return monthTicketList.value.map((item) => ({
    name: formatMonth(item.month),
    value: item.ticketCount * DATA_SCALE_MULTIPLE,
  }));
});

const handleBoxOfficeList = computed<ChartItem[]>(() => {
  return boxOfficeList.value.map((item) => ({
    name: filmTypeList[item.type] || "未知类型", // 容错：避免类型不存在导致的空值
    value: item.totalBoxOffice * DATA_SCALE_MULTIPLE,
  }));
});

const handleMonthAmountList = computed<ChartItem[]>(() => {
  return amountList.value.map((item) => ({
    name: formatMonth(item.month),
    value: item.totalAmount,
  }));
});

// ================ 7. 异步请求（核心优化：错误处理 + 并行请求） ================
/**
 * 获取影片票房数据
 */
const getFilmBoxOffice = async () => {
  try {
    const res = await getFilmBoxOfficeApi();
    filmList.value = res || []; // 容错：处理接口返回null/undefined的情况
    // 按票房降序排序
    filmList.value.sort((a, b) => b.boxOffice - a.boxOffice);
  } catch (error) {
    console.error("获取影片票房数据失败：", error);
    filmList.value = []; // 异常时重置为空数组，避免页面报错
  }
};

/**
 * 获取月度销量数据
 */
const getMonthTicket = async () => {
  try {
    const res = await getMonthTicketApi();
    monthTicketList.value = res || [];
  } catch (error) {
    console.error("获取月度销量数据失败：", error);
    monthTicketList.value = [];
  }
};

/**
 * 获取按类型统计的票房数据
 */
const getBoxOfficeByType = async () => {
  try {
    const res = await getBoxOfficeByTypeApi();
    boxOfficeList.value = res || [];
  } catch (error) {
    console.error("获取按类型统计的票房数据失败：", error);
    boxOfficeList.value = [];
  }
};

/**
 * 获取月度金额数据
 */
const getMonthAmount = async () => {
  try {
    const res = await getMonthAmountApi();
    amountList.value = res || [];
  } catch (error) {
    console.error("获取月度金额数据失败：", error);
    amountList.value = [];
  }
};

// ================ 8. 初始化函数（核心优化：统一管理 + 并行请求提升性能） ================
const initData = async () => {
  // 并行请求：多个接口同时请求，减少总加载时间
  await Promise.all([
    getFilmBoxOffice(),
    getMonthTicket(),
    // getBoxOfficeByType(),
    getMonthAmount(),
  ]);
};

// ================ 9. 生命周期 ================
onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
#home {
  padding: 10px;

  .echarts {
    display: grid;
    // 使用常量统一维护尺寸，便于后续调整
    grid-template-columns: repeat(2, #{CHART_GRID_SIZE}px);
    grid-template-rows: repeat(2, #{CHART_GRID_SIZE}px);
    place-items: center;
    gap: #{CHART_GRID_GAP}px;
    padding: 30px 0;
  }
}
</style>