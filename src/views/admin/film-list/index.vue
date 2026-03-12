<template>
  <div id="film">
    <SearchTableTemplate ref="searchTableTemplateRef" :extra-params="extraParams" :table-params-list="tableParamsList"
      :search-params-list="searchParamsList" :show-search-form="true" :getTableData="getTableData">
      <template #handle>
        <el-button type="primary" @click="showEditDialog()">新增影片</el-button>
      </template>
    </SearchTableTemplate>

    <!-- <AddScheduleDialog
      :show-dialog="dialogFormVisible"
      :film="film"
      ref="addScheduleRef"
      @cancel="cancel"
    /> -->
    <EditFilmDialog v-if="visible" :filmItem="filmItem" v-model:visible="visible" @handle-success="handleSuccess" />
  </div>
</template>



<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, h } from "vue";
import { ElMessage, ElMessageBox, ElButton } from "element-plus";
import { pageQueryFilm, deleteFilmById } from "@/api/film";
// import AddScheduleDialog from "../schedule/components/AddScheduleDialog.vue";
import EditFilmDialog from "./components/EditFilmDialog.vue";
import SearchTableTemplate, {
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";
import { filmStatusOptions, filmTypeList, filmRegionList } from "@/utils/constant";
import { ElTag } from "element-plus";
defineOptions({
  name: 'adminFilm'
})
// 响应式数据
const visible = ref(false);
const filmItem = ref({});
const dialogFormVisible = ref(false);
const film = ref({});
const searchTableTemplateRef = ref(null);
const addScheduleRef = ref(null);

const extraParams = ref({});

const tableParamsList = ref<TableParamType[]>([
  {
    label: "名称",
    prop: "title",
    width: 150,
  },
  {
    label: "海报",
    prop: "poster",
    render: (value: string) => {
      return h("img", { src: value, class: "image" });
    },
    width: 200,
  },
  {
    label: "上映日期",
    prop: "releaseDate",
    width: 150,
  },
  {
    label: "下线日期",
    prop: "endDate",
    width: 150,
  },

  {
    label: "影片类型",
    prop: "types",
    width: 100,
  },
  {
    label: "发行地区",
    prop: "regions",
    width: 100,
  },
  {
    label: "时长(分钟)",
    prop: "duration",
    width: 120,
  },
  {
    label: "上映状态",
    prop: "status",
    width: 150,
    render: (value: number) => {
      const { label, type } = filmStatusOptions.find(item => item.value === value) || {}
      return h(ElTag, { type }, () => label)
    }
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 180,
  },
  {
    label: "更新时间",
    prop: "updateTime",
    width: 180,
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
            onClick: () => showEditDialog(row),
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

const searchParamsList = ref<SearchParamType[]>([
  {
    label: "影片名",
    prop: "title",
    type: "input",
    placeholder: "请输入",
  },
  {
    label: "影片类型",
    prop: "types",
    type: "select",
    placeholder: "请选择",
    options: filmTypeList.map((typeName) => ({ value: typeName, label: typeName })),
  },
  {
    label: "发行地区",
    prop: "regions",
    type: "select",
    placeholder: "请选择",
    options: filmRegionList.map((regionName) => ({ value: regionName, label: regionName })),
  },
  {
    label: "上映状态",
    prop: "status",
    type: "select",
    placeholder: "请选择",
    options: filmStatusOptions,
  },
]);

const getTableData = async (pageParams: PagerType, searchParams: Record<string, any>) => {

  const res = await pageQueryFilm({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total
  }
};


// 方法
const handleSuccess = () => {
  searchTableTemplateRef.value.pageQuery();
};

const showEditDialog = (row = {}) => {
  filmItem.value = row;
  visible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("此操作将永久删除该影片, 是否继续?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteFilmById(row.id);
    ElMessage.success("删除成功");
    searchTableTemplateRef.value.pageQuery();
  } catch (error) {
    if (error === "cancel") {
      ElMessage.info("已取消删除");
    } else {
      console.error("删除失败:", error);
    }
  }
};

const showAddSchduleForm = (row) => {
  dialogFormVisible.value = true;
  film.value = row;

  nextTick(() => {
    if (addScheduleRef.value) {
      addScheduleRef.value.init();
    }
  });
};

const cancel = () => {
  dialogFormVisible.value = false;
};
</script>



<style>
.image {
  width: 120px;
}
</style>
