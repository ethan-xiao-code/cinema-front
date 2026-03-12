<template>
  <div id="screen_room">
    <SearchTableTemplate
      ref="searchTableTemplateRef"
      :extra-params="extraParams"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="showSearchForm"
      :getTableData="getTableData"
    >
      <template #handle>
        <el-button
          type="primary"
          @click="showAddForm"
        >新增影院</el-button>
      </template>
    </SearchTableTemplate>
    <EditCinemaForm
      v-if="showEditDialog"
      v-model:showEditDialog="showEditDialog"
      :currentRow="currentRow"
      :isAdd="isAdd"
      @reloadData="reloadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from "vue";
import { ElMessage, ElMessageBox,ElButton } from "element-plus";
import EditCinemaForm from "./components/EditCinemaForm.vue";
import { deleteCinemaApi, pageQueryCinemaApi } from "@/api/cinema";
import SearchTableTemplate, { PagerType, SearchParamType, TableParamType } from "@/components/SearchTableTemplate.vue";
import { provinceOptions } from "@/utils/area";
import { CinemaFormType } from "@/api/cinema/type";

// 响应式数据
const showEditDialog = ref(false);
const searchTableTemplateRef = ref<typeof SearchTableTemplate>();
const currentRow = ref<any>(null);
const isAdd = ref(true);

// 表格配置
const tableParamsList = ref<TableParamType[]>([
  {
    label: "影院名",
    prop: "name",
    width: 200,
  },
  {
    label: "所在地区",
    prop: "pcaName",
    width: 200,
  },
  {
    label: "详细地址",
    prop: "address",
    width: 200,
  },
  {
    label: "状态",
    prop: "bussinessStatus",
    renderText: (value: any) => {
      return value === 1 ? "正常" : "停业";
    },
    width: 100,
  },
  {
    label: "营业时间",
    prop: "openingHours",
    width: 100,
  },
  {
    label: "简介",
    prop: "description",
    width: 200,
    render: (value: string) => {
      return h("div", { class: "descText" }, value); // 构建DOM元素
    },
  },
  {
    label: "创建日期",
    prop: "createTime",
    width: 200,
  },
  {
    label: "更新日期",
    prop: "updateTime",
    width: 200,
  },
  {
    label: "操作",
    width: 150,
    prop: "option",
    fixed: 'right',
    render: (_: any,row: CinemaFormType) => {
      return h("div", { class: "action-buttons" }, [
        h(
          ElButton,
          {
            type: "warning",
            size: "small",
            onClick: () => showUpdateForm(row),
          },
          () => "编辑" // 接受函数返回值的形式，不然会报警告
        ),
        h(
          ElButton,
          {
            type: "danger",
            size: "small",
            onClick: () => handleDelete(row),
          },
          () => "删除"
        ),
      ]);
    },
  },
]);

const extraParams = ref({});
const showSearchForm = ref(true);

const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影院名",
    prop: "name",
    type: "input",
    placeholder: "请输入影院名",
  },
  {
    label: "所在省份",
    prop: "provinceName",
    type: "select",
    placeholder: "请选择所在省份",
    options: provinceOptions,
    attrs: {
      filterable: true
    }
  },
]);

const getTableData = async (pageParams: PagerType, searchParams: Record<string,any>) => {

  const res = await pageQueryCinemaApi({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total
  }
};

// 方法
const showAddForm = () => {
  showEditDialog.value = true;
  isAdd.value = true;
  currentRow.value = null;

};

const showUpdateForm = async (row: any) => {
  showEditDialog.value = true;
  isAdd.value = false;
  currentRow.value = row;
};

const reloadData = () => {
  searchTableTemplateRef.value?.pageQuery();
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("此操作将永久删除该影院, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteCinemaApi(row.id);
    reloadData();
    ElMessage.success("删除放映厅成功");
  } catch (error) {
    if (error === "cancel") {
      ElMessage.info("已取消删除");
    } else {
      console.error("删除放映厅失败:", error);
      ElMessage.error("删除失败");
    }
  }
};
</script>

<style>
.w80 {
  width: 80%;
}

.descText {
  white-space: nowrap;
  /* 强制文本在一行显示，不换行 */
  overflow: hidden;
  /* 隐藏超出容器的部分 */
  text-overflow: ellipsis;
  /* 超出部分用省略号代替 */
}
</style>
