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
        <el-button type="primary" @click="showAddForm">新增轮播图</el-button>
      </template>
    </SearchTableTemplate>
    <EditForm
      v-if="showEditDialog"
      v-model:showEditDialog="showEditDialog"
      :currentRow="currentRow"
      :isAdd="isAdd"
      :filmOptions="filmOptions"
      @reloadData="reloadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from "vue";
import { ElMessage, ElMessageBox, ElButton } from "element-plus";
import { deleteCinemaApi, pageQueryCinemaApi } from "@/api/cinema";
import SearchTableTemplate, {
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";
import { CinemaFormType } from "@/api/cinema/type";
import EditForm from "./components/EditForm.vue";
import { getFilmListApi } from "@/api/film/index";
import { OptionsType } from "@/api/schedule/type";
import { deleteCinemaCarouselApi, pageCinemaCarouselApi } from "@/api/cinema-carousel";
defineOptions({
  name: 'adminCarousel'
})
// 响应式数据
const showEditDialog = ref(false);
const searchTableTemplateRef = ref<typeof SearchTableTemplate>();
const currentRow = ref<any>(null);
const isAdd = ref(true);

// 表格配置
const tableParamsList = ref<TableParamType[]>([
  {
    label: "影片ID",
    prop: "filmId",
    width: 200,
  },
  {
    label: "影片名",
    prop: "filmName",
    width: 200,
  },
  {
    label: "轮播图",
    prop: "imgUrl",
    width: 200,
     render: (value: string) => {
      return h("img", { src: value, class: "imgUrlClass" });
    },
  },
  
  {
    label: "排序",
    prop: "sort",
    width: 100,
  },
  {
    label: "简介",
    prop: "remark",
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
const filmOptions = ref<OptionsType[]>([]);
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "filmId",
    type: "select",
    placeholder: "请选择影片名",
    options: computed(() => filmOptions.value.map((item: any) => ({
      label: item.label,
      value: item.value
    }))),
    attrs: {
      filterable: true,
    },
  },
]);

onMounted(() => {
  initFilmList();
});

const initFilmList = async () => {
  const data = (await getFilmListApi()) || [];
  filmOptions.value = data.map((item: any) => ({
    ...item,
    label: item.title as string,
    value: item.id,
  }));
};

const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  const res = await pageCinemaCarouselApi({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total,
  };
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
    await ElMessageBox.confirm("确定要删除该轮播图吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteCinemaCarouselApi(row.id);
    reloadData();
    ElMessage.success("删除轮播图成功");
  } catch (error) {
    if (error === "cancel") {
      ElMessage.info("已取消删除");
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
.imgUrlClass {
  width: 100%;
  height: 110px; 
}
</style>
