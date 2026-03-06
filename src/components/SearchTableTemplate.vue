<template>
  <div id="tableTemplate">
    <div class="searchArea">
      <el-form ref="searchFormRef" v-if="showSearchForm" :model="searchParamsForm" :inline="true" size="default"
        label-width="auto">
        <template v-for="(item, index) in searchParamsList" :key="index">
          <el-form-item :label="item.label" :prop="item.prop">
            <template v-if="item.type === 'input'">
              <el-input class="w180" v-model="searchParamsForm[item.prop]" :placeholder="item.placeholder" clearable
                v-bind="item.attrs"></el-input>
            </template>

            <template v-if="item.type === 'select'">
              <el-select v-model.trim="searchParamsForm[item.prop]" class="w180" clearable v-bind="item.attrs">
                <el-option v-for="(option, optionIndex) in item.options as OptionType[]" :key="optionIndex"
                  :label="option.label" :value="option.value"></el-option>
              </el-select>
            </template>

            <template v-if="item.type === 'time'">
              <el-date-picker v-model="searchParamsForm[item.prop]" class="w180" type="date"
                v-bind="item.attrs"></el-date-picker>
            </template>

            <template v-if="item.type === 'searchSlot'">
              <slot name="searchSlot" :searchParamsForm="searchParamsForm" :itemProp="item.prop"></slot>
            </template>
          </el-form-item>
        </template>
      </el-form>
      <div class="buttonArea">
        <!-- 具名插槽，用于插入新增等功能的按钮 -->
        <div class="btns">
          <slot name="handle"></slot>
        </div>
        <div class="btns">
          <el-button :loading="loading" type="primary" @click="pageQuery">查询</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </div>
      </div>
    </div>
    <BaseLoading :loading="loading" text="数据加载中...">
      <el-table v-bind="tableProps" :max-height="700" :data="resultTableList">
        <template v-for="item in tableParamsList" :key="item.prop">
          <el-table-column :fixed="item?.fixed" :width="item.width" :label="item?.label" :prop="item?.prop"
            :type="item?.type" v-bind="item?.attrs">
            <template #default="scope">
              <div v-if="item.renderText">
                <!-- 渲染文本 -->
                {{ item.renderText(scope.row[item.prop]) }}
              </div>
              <div v-else-if="item.render">
                <!-- 渲染DOM元素 -->
                <component :is="item.render!(scope.row[item.prop], scope.row)" />
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </BaseLoading>

    <Pager :pageNo="pageParams.pager.pageNo" :pageSize="pageParams.pager.pageSize" :total="pageParams.total"
      @changePageSize="handleSizeChange" @changePageNo="handleCurrentChange"></Pager>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  VNode,
  toRaw,
  type ComputedRef,
  type DefineComponent,
} from "vue";
import { debounce } from "lodash-es";
import Pager from "@/components/Pager.vue";
import type { FormInstance } from "element-plus";
import type { TableProps } from "element-plus";
import { useRequest } from "@/utils/useRequest";
import BaseLoading from "./BaseLoading.vue";

// 更精确的类型定义
interface OptionType {
  label: string;
  value: any;
}

export interface SearchParamType {
  label: string;
  prop: string;
  type: "input" | "select" | "time" | "searchSlot";
  placeholder?: string;
  style?: Record<string, any>;
  // options 可以是普通数组或计算属性数组
  options?: OptionType[] | ComputedRef<OptionType[]>;
  // attrs 兼容任意额外属性（按需可进一步细化）
  attrs?: Record<string, any>;
}

export interface TableParamType {
  label?: string;
  prop?: string;
  width?: number;
  fixed?: "right" | "left" | "";
  type?: "selection" | "index" | "expand";
  renderText?: (value?: any, row?: Record<string, any>) => any;
  render?: (
    value?: any,
    row?: Record<string, any>
  ) => VNode | DefineComponent | string | Record<string, any>;
  attrs?: Record<string, any>;
}

export interface PagerType {
  pageNo: number;
  pageSize: number;
}

interface PageParamsType {
  pager: PagerType;
  total: number;
}

interface TableRow {
  [key: string]: any;
}

// Props（更精确的泛型）
const props = defineProps<{
  tableParamsList: TableParamType[];
  tableProps?: TableProps<TableRow>;
  extraParams?: Record<string, any>;
  searchParamsList: SearchParamType[];
  showSearchForm?: boolean;
  getTableData: (
    pageParams: PagerType,
    searchParams: Record<string, any>
  ) => Promise<{ data: TableRow[]; total: number }>;
}>();

// Emits（签名风格）
const emit = defineEmits<{
  "update:extraParams": (value: Record<string, any>) => void;
}>();

// 响应式数据
const searchFormRef = ref<FormInstance | null>(null);
const pageParams = reactive<PageParamsType>({
  pager: {
    pageNo: 1,
    pageSize: 10,
  },
  total: 0,
});
const resultTableList = reactive<TableRow[]>([]);
const searchParamsForm = reactive<Record<string, any>>({});

// const pageQuery = debounce(async () => {
//   const res = await props.getTableData(
//     { ...pageParams.pager },
//     toRaw(searchParamsForm) // 解除响应式
//   );
//   console.log(res, "res**");
//   resultTableList.splice(0, resultTableList.length);
//   Object.assign(resultTableList, res?.data || []);
//   pageParams.total = res?.total ?? 0;
// }, 300);

const getDataApi = () => {
  return props.getTableData(
    { ...pageParams.pager },
    toRaw(searchParamsForm) // 解除响应式
  )
}

const { loading, runFn: pageQuery } = useRequest(getDataApi, {
  onSuccess: (res) => {
    resultTableList.splice(0, resultTableList.length);
    Object.assign(resultTableList, res?.data || []);
    pageParams.total = res?.total ?? 0;
  },
})
// 分页处理
const handleSizeChange = (val: number): void => {
  pageParams.pager.pageSize = val;
  pageQuery();
};

const handleCurrentChange = (val: number): void => {
  pageParams.pager.pageNo = val;
  pageQuery();
};

const reset = (): void => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields();
  }
  pageParams.pager = {
    pageNo: 1,
    pageSize: 10,
  };
  pageQuery();
};

onMounted(() => {
  pageQuery();
});



// 对外暴露
defineExpose({
  searchParamsForm, // 查询参数
  pageQuery, // 分页查询方法
});
</script>

<style scoped lang="scss">
#tableTemplate {
  // display: inline-block;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .searchArea {
    background-color: #fff;
    padding: 20px;
  }

  .w180 {
    width: 180px;
  }

  .buttonArea {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 8px;

    .btns {
      display: flex;
      flex-wrap: wrap;
    }
  }
}
</style>
