<template>
  <div id="screen_room">
    <!-- 编辑放映厅表单组件 -->
    <EditScreenForm
      v-if="dialogFormVisible"
      v-model:showEditDialog="dialogFormVisible"
      :form-data="currentFormData"
      :actionType="actionType"
      :title="title"
      :cinemaOptions="cinemaOptions"
      @success="handleFormSuccess"
    />

    <SearchTableTemplate
      ref="searchTableTemplateRef"
      :extra-params="extraParams"
      :table-params-list="tableParamsList"
      :search-params-list="searchParamsList"
      :show-search-form="showSearchForm"
      :getTableData="getTableData"

    >
      <template #handle>
        <el-button type="primary" @click="showAddForm">新增放映厅</el-button>
      </template>
    </SearchTableTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from "vue";
import { ElMessage, ElMessageBox, ElButton } from "element-plus";
import { useUserStore } from "@/stores";
import EditScreenForm, {
  ActionType,
  ScreenFormType,
} from "./components/EditScreenForm.vue";
import { getCinemaListApi } from "@/api/cinema";
import { PagerType, SearchParamType } from "@/components/SearchTableTemplate.vue";
import { screenTypeOptions } from "@/utils/constant";
import { deleteScreenApi, getScreenByIdApi, pageQueryScreenApi } from "@/api/screen";

// 响应式数据
const dialogFormVisible = ref(false);
const searchTableTemplateRef = ref(null);
const currentFormData = ref<ScreenFormType>();
const actionType = ref<ActionType>("add");
const title = ref("");
defineOptions({
  name: 'adminScreen'
})
export type CinemaOptions = {
  label: string;
  value: any;
};
// 表格配置
const tableParamsList = ref([
  {
    label: "名称",
    prop: "name",
    width: 100
  },
  {
    label: "影院名",
    prop: "cinemaId",
    width: 150,
    renderText: (value: any) => {
      const item =
        cinemaOptions.value.find(
          (item: CinemaOptions) => item.value === value
        ) || {};
      return item.label;
    },
  },
  {
    label: "座位数",
    prop: "seatCount",
    width: 80,
  },
  {
    label: "类型",
    prop: "screeningType",
    renderText: (value: any) => {
      return screenTypeOptions.find(item => item.value === value)?.label || '';
    },
    width: 100,
  },
  {
    label: "介绍",
    prop: "description",
    width: 200,
    render: (value: string) => {
      return h("div", { class: "showOneRowText" }, value);
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
    fixed: "right",
    render: (_: any, row: any) => {
      return h("div", { class: "action-buttons" }, [
        h(
          ElButton,
          {
            type: "warning",
            size: "small",
            onClick: () => showUpdateForm(row),
          },
          () => "编辑"
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
const cinemaOptions = ref<CinemaOptions[]>([]);
const extraParams = ref({});
const showSearchForm = ref(true);
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影院名",
    prop: "cinemaId",
    type: "select",
    placeholder: "请选择影院名",
    options: [],
    filterable: true
  },
  {
    label: "放映类型",
    prop: "screeningType",
    type: "select",
    placeholder: "请选择放映类型",
    options: screenTypeOptions,
  },
]);
const getTableData = async (pageParams: PagerType, searchParams: Record<string,any>) => {

  const res = await pageQueryScreenApi({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total
  }
};

// 生命周期
onMounted(() => {
  getCinemaList();
});

const getCinemaList = async () => {
  const data = await getCinemaListApi();
  console.log(data, "data");
  cinemaOptions.value = data.map(({ id, name }) => ({
    label: name,
    value: id,
  }));
  searchParamsList.value[0].options = cinemaOptions.value
  // console.log(cinemaOptions.value,'vcinemaOptions')
};

// 方法
const showAddForm = () => {
  actionType.value = "add";
  title.value = "新增放映厅";
  currentFormData.value = undefined;
  dialogFormVisible.value = true;
};

const showUpdateForm = async (row: any) => {
  actionType.value = "update";
  title.value = "修改放映厅";

  try {
    const res = await getScreenByIdApi(row.id);
    currentFormData.value = res;
    dialogFormVisible.value = true;
  } catch (error) {
    console.error("获取放映厅详情失败:", error);
    ElMessage.error("获取放映厅详情失败");
  }
};

const handleFormSuccess = () => {
  searchTableTemplateRef.value.pageQuery();
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("此操作将永久删除放映厅, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteScreenApi(row.id);
    ElMessage.success("删除放映厅成功");
    searchTableTemplateRef.value.pageQuery();
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

<style scoped>
.showOneRowText {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
