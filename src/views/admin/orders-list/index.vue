<template>
  <div id="orders">
    <SearchTableTemplate ref="searchTableTemplateRef" :table-params-list="tableParamsList"
      :search-params-list="searchParamsList" :getTableData="getTableData" :show-search-form="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from "vue";
import { ElTag } from "element-plus";
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

const searchTableTemplateRef = ref<typeof SearchTableTemplate>();

/** 表格列配置 */
const tableParamsList = ref<TableParamType[]>([
  {
    label: "订单ID",
    prop: "id",
  },
  // {
  //   label: "影片ID",
  //   prop: "filmId",
  //   width: 100,
  // },
  {
    label: "影片名",
    prop: "filmName",
    minWidth: 160
  },
  // {
  //   label: "图片",
  //   prop: "poster",
  //   width: 120,
  //   render: (value: string) => {
  //     return h("img", {
  //       src: value,
  //       class: "imgUrlClass",
  //     });
  //   },
  // },
  {
    label: "放映厅名",
    prop: "screenRoomName",
  },
  // {
  //   label: "放映厅ID",
  //   prop: "screenRoomId",
  //   width: 100,
  // },
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
      return h(ElTag, { type: item?.type as any  }, () => item?.label);
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

/** 表格数据请求 */
const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  const res = await pageQueryOrdersApi({
    ...pageParams,
    ...searchParams,
    userIds: searchParams.userIds?.join(","),
    filmIds: searchParams.filmIds?.join(","),
  });

  return {
    data: res.records,
    total: res.total,
  };
};
</script>

<style lang="scss">
.imgUrlClass {
  height: 165px;
}
</style>