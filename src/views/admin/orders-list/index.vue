<template>
  <div id="orders">
    <SearchTableTemplate ref="searchTableTemplateRef" :table-params-list="tableParamsList"
      :search-params-list="searchParamsList" :getTableData="getTableData" :show-search-form="true">
      <template #handle>
        <el-button type="success" @click="goToDataBoard">数据大盘分析</el-button>
      </template>
    </SearchTableTemplate>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentOrder.username }}</el-descriptions-item>
        <el-descriptions-item label="影片名">{{ currentOrder.filmName }}</el-descriptions-item>
        <el-descriptions-item label="放映厅">{{ currentOrder.screenRoomName }}</el-descriptions-item>
        <el-descriptions-item label="座位号">{{ currentOrder.seatNumberStr }}</el-descriptions-item>
        <el-descriptions-item label="交易金额">￥{{ currentOrder.amount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getItemByValue(payStatusOptions, currentOrder.status)?.type as any">
            {{ getItemByValue(payStatusOptions, currentOrder.status)?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '未支付' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElTag, ElButton } from "element-plus";
import SearchTableTemplate, {
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";

import { pageQueryOrdersApi } from "@/api/orders";
import { computed } from "vue";
import { getValidFilmListApi } from "@/api/film/index";
import { OptionsType } from "@/api/schedule/type";
import { getUserListApi } from "@/api/user";
import { getItemByValue, payStatusOptions } from "@/utils/constant";

defineOptions({
  name: "adminOrders",
});

const router = useRouter();

const searchTableTemplateRef = ref<typeof SearchTableTemplate>();

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
  {
    label: "操作",
    prop: "option",
    fixed: "right",
    minWidth: 100,
    render: (_: any, row: any) => {
      return h(ElButton, {
        type: "primary",
        size: "small",
        onClick: () => openDetail(row)
      }, () => "查看详情");
    }
  }
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

onMounted(() => {
  initFilmList()
  initUserList()
})

const initFilmList = async () => {
  const data = (await getValidFilmListApi()) || [];
  filmOptions.value = data.map((item: any) => ({
    ...item,
    label: item.title,
    value: item.title,
  }));
};

const initUserList = async () => {
  const data = (await getUserListApi()) || [];
  userOptions.value = data.map((item: any) => ({
    ...item,
    label: item.username,
    value: item.id,
  }));
};

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
    startTime = searchParams.payDateRange[0] + " 00:00:00";
    endTime = searchParams.payDateRange[1] + " 23:59:59";
  }
  const res = await pageQueryOrdersApi({
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

/** 订单详情逻辑 */
const detailVisible = ref(false);
const currentOrder = ref<any>(null);
const openDetail = (row: any) => {
  currentOrder.value = row;
  detailVisible.value = true;
};

/** 跳转到数据大盘 */
const goToDataBoard = () => {
  const query: any = {};
  if (currentSearchParams.value.payDateRange && currentSearchParams.value.payDateRange.length === 2) {
    query.startTime = currentSearchParams.value.payDateRange[0];
    query.endTime = currentSearchParams.value.payDateRange[1];
  }
  if (currentSearchParams.value.filmIds && currentSearchParams.value.filmIds.length > 0) {
    // 取第一个选择的影片名作为数据大盘的检索条件
    query.filmName = currentSearchParams.value.filmIds[0];
  }
  router.push({ path: "/admin/data-board", query });
};
</script>

<style lang="scss">
.imgUrlClass {
  height: 165px;
}
</style>