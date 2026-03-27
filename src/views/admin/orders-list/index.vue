<template>
  <SearchTableTemplate ref="searchTableTemplateRef" :table-params-list="tableParamsList"
    :search-params-list="searchParamsList" :getTableData="getTableData" :show-search-form="true">
    <template #handle>
      <el-button type="success" @click="goToDataBoard">票房统计可视化分析</el-button>
    </template>
  </SearchTableTemplate>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onActivated, computed } from "vue";
import { useRouter } from "vue-router";
import { ElTag, ElButton } from "element-plus";
import SearchTableTemplate, {
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";

import { pageQueryOrdersApi } from "@/api/orders";
import { getValidFilmListApi } from "@/api/film/index";
import { OptionsType } from "@/api/schedule/type";
import { getUserListApi } from "@/api/user";
import { getItemByValue, payStatusOptions } from "@/utils/constant";
import dayjs from 'dayjs'
import { useRequest } from "@/utils/useRequest";
defineOptions({
  name: "adminOrders",
});

const router = useRouter();

/** 表格列配置 */
const tableParamsList = ref<TableParamType[]>([
  {
    label: "订单ID",
    prop: "id",
  },
  {
    label: "影片名",
    prop: "filmName",
    minWidth: 160
  },
  {
    label: "放映厅名",
    prop: "screenRoomName",
  },
  {
    label: "座位号",
    prop: "seatNumberStr",
  },
  {
    label: "用户名",
    prop: "username",
  },
  {
    label: "交易金额(元)",
    prop: "amount",
    render: (value: number) => {
      return h("b", null, `${value.toFixed(2)}`);
    },
    minWidth: 100
  },
  {
    label: "售票数",
    prop: "seatNumberStr",
    renderText: (val) => val.split(",").length || 0
  },
  {
    label: "支付状态",
    prop: "status",
    render: (value: number) => {
      const item = getItemByValue(payStatusOptions, value)
      return h(ElTag, { type: item?.type as any }, () => item?.label);
    },
  },
  {
    label: "支付时间",
    prop: "payTime",
    minWidth: 160
  },

]);
const filmOptions = ref<OptionsType[]>([]);
const userOptions = ref<OptionsType[]>([]);
/** 搜索配置 */
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "filmIds",
    type: "select",
    options: computed(() =>
      filmOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
    attrs: {
      placeholder: "请选择影片",
      multiple: true,
      clearable: true,
      filterable: true,
      reserveKeyword: false, // 选中一个选项后是否保留当前的搜索关键词
    },
  },
  {
    label: "用户名",
    prop: "userIds",
    type: "select",
    options: computed(() =>
      userOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
    attrs: {
      placeholder: "请选择用户",
      multiple: true,
      clearable: true,
      filterable: true,
      reserveKeyword: false, // 选中一个选项后是否保留当前的搜索关键词
    },
  },
  {
    label: "订单状态",
    prop: "orderStatus",
    type: "select",
    options: payStatusOptions,
    attrs: {
      placeholder: "请选择状态",
      clearable: true,
    },
  },
  {
    label: "支付时间",
    prop: "payDateRange",
    type: "time",
    attrs: {
      "start-placeholder": "请选择开始时间",
      "end-placeholder": "请选择结束时间",
      type: "daterange",
      format: "YYYY-MM-DD",
      "value-format": "YYYY-MM-DD",
    },
  },
]);

const currentSearchParams = ref<any>({});

/** 表格数据请求 */
const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  currentSearchParams.value = searchParams;
  let startTime = "";
  let endTime = "";
  if (searchParams.payDateRange && searchParams.payDateRange.length === 2) {
    startTime = dayjs(searchParams.payDateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs(searchParams.payDateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  }
  const res = await fetchOrders({
    ...pageParams,
    ...searchParams,
    startTime,
    endTime,
    userIds: searchParams.userIds?.join(","),
    filmIds: searchParams.filmIds?.join(","),
  });

  return {
    data: res.records,
    total: res.total,
  };
};

const { runFn: initFilmList, loading: filmLoading } = useRequest(getValidFilmListApi, {
  onSuccess: (data) => {
    filmOptions.value = (data || []).map((item: any) => ({
      ...item,
      label: item.title,
      value: item.title,
    }));
  }
});

const { runFn: initUserList, loading: userLoading } = useRequest(getUserListApi, {
  onSuccess: (data) => {
    userOptions.value = (data || []).map((item: any) => ({
      ...item,
      label: item.username,
      value: item.id,
    }));
  }
});


// manual: true, 因为表格数据是由 SearchTableTemplate 组件控制加载的
const { runFn: fetchOrders } = useRequest(pageQueryOrdersApi);

onMounted(() => { // 仅在组件首次挂载时执行一次
  initUserList()
})

onActivated(() => { // 每次组件被激活时（包括从缓存中恢复）执行
  initFilmList()
})


/** 跳转到票房统计可视化 */
const goToDataBoard = () => {
  const query: any = {};
  if (currentSearchParams.value.payDateRange && currentSearchParams.value.payDateRange.length === 2) {
    query.startTime = currentSearchParams.value.payDateRange[0];
    query.endTime = currentSearchParams.value.payDateRange[1];
  }
  if (currentSearchParams.value.filmIds && currentSearchParams.value.filmIds.length > 0) {
    // 取第一个选择的影片名作为票房统计可视化的检索条件
    query.filmName = currentSearchParams.value.filmIds[0];
  }
  router.push({ path: "/admin/data-board", query });
};
</script>

<style lang="scss" scoepd></style>