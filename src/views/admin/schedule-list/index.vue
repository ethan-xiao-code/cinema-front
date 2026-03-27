<template>
  <div id="schedule">
    <SearchTableTemplate ref="searchTableTemplateRef" :table-params-list="tableParamsList"
      :search-params-list="searchParamsList" :show-search-form="true" :getTableData="getTableData"
      :tableProps="tableProps">
      <template #handle>
        <el-button type="primary" @click="showAddDialog">新增排片</el-button>
        <el-button type="primary" :disabled="selectRows.length === 0" @click="confirmPublish">批量发布排片</el-button>
      </template>
    </SearchTableTemplate>

    <EditScheduleDialog v-if="dialogFormVisible" v-model="dialogFormVisible" :actionType="actionType"
      :schedule="scheduleForm" :filmOptions="filmOptions" :screenRoomOptions="screenRoomOptions"
      @handleSuccess="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  h,
} from "vue";
import { getScreenRoomListApi } from "@/api/screen";
import {
  pageQueryScheduleApi,
  publishScheduleApi,
  unPublishScheduleApi,
} from "@/api/schedule";
import EditScheduleDialog from "./components/EditScheduleDialog.vue";
import SearchTableTemplate from "@/components/SearchTableTemplate.vue";
import type {
  PagerType,
  SearchParamType,
  TableParamType,
} from "@/components/SearchTableTemplate.vue";
import { languageList, shceduleStatusOptions } from "@/utils/constant";
import { dayjs, ElButton } from "element-plus";
import {
  OptionsType,
  ScheduleFormType,
  ScheduleStatus,
} from "@/api/schedule/type";
import { getValidFilmListApi } from "@/api/film/index";
import { ElTag } from "element-plus";
import { ElMessage } from "element-plus";
defineOptions({
  name: 'adminSchedule'
})
export type ScheduleActionType = "add" | "update";
// 响应式数据
const dialogFormVisible = ref(false);
const actionType = ref<ScheduleActionType>("add");
const searchTableTemplateRef = ref<InstanceType<typeof SearchTableTemplate>>();

const screenRoomOptions = ref<OptionsType[]>([]);
const filmOptions = ref<OptionsType[]>([]);

const scheduleForm = ref<ScheduleFormType | null>(null);
const selectRows = ref<ScheduleFormType[]>([]);
const handleSelectChange = (list: ScheduleFormType[]) => {
  selectRows.value = [...list];
};

const tableProps = {
  onSelectionChange: handleSelectChange,
  data: [],
};
const handleSelectable = (row: ScheduleFormType) => {
  // 动态显示多选框（只有未发布状态才显示多选框）
  // console.log(row.status,'row')
  return row.status === ScheduleStatus.Unpubilshed;
};
// 表格列配置
const tableParamsList = ref<TableParamType[]>([
  {
    type: "selection",
    fixed: "left",
    attrs: {
      selectable: handleSelectable,
    },
  },
  {
    label: "ID",
    prop: "id",
    fixed: "left",
  },
  {
    label: "影片名",
    prop: "filmName",
    minWidth: 160
  },
  {
    label: "放映厅",
    prop: "screenRoomName",
  },
  {
    label: "语言",
    prop: "language",
  },
  {
    label: "时长(分钟)",
    prop: "duration",
    minWidth: 100
  },
  {
    label: "票价(元)",
    prop: "price",
  },
  // {
  //   label: "放映日期",
  //   prop: "screeningDate",
  //   width: 120
  // },
  {
    label: "开始时间",
    prop: "startTime",
    renderText: (time: string) => {
      return dayjs(time).format("YYYY-MM-DD HH:mm");
    },
    minWidth: 160
  },
  {
    label: "结束时间",
    prop: "endTime",
    renderText: (time: string) => {
      return dayjs(time).format("YYYY-MM-DD HH:mm");
    },
    minWidth: 160
  },
  {
    label: "排片状态",
    prop: "status",
    render: (val: number) => {
      const { label, type } =
        shceduleStatusOptions.find((item: any) => item.value === val) || {};
      return h(
        ElTag,
        {
          type: type as any,
        },
        () => label
      );
    },
  },
  {
    label: "创建时间",
    prop: "createTime",
    minWidth: 160
  },
  {
    label: "更新时间",
    prop: "updateTime",
    minWidth: 160

  },
  {
    label: "操作",
    width: 200,
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
            disabled: row.status !== ScheduleStatus.Unpubilshed // 只有未发布的排片可以进行编辑
          },
          () => "编辑"
        )
        ,
        row.status === ScheduleStatus.Unpubilshed
          ? h(
            ElButton,
            {
              type: "success",
              size: "small",
              onClick: () => {
                selectRows.value.push(row)
                confirmPublish()
              },
            },
            () => "发布" // 将排片同步到购票前台
          )
          : null,
        // 取消发布功能等以后再扩展
        // row.status === ScheduleStatus.Published
        //   ? h(
        //     ElButton,
        //     {
        //       type: "danger",
        //       size: "small",
        //       onClick: () => {
        //         confirmUnPublish(row)
        //       },
        //     },
        //     () => "取消发布"
        //   )
        //   : null,
      ]);
    },
  },
]);


// 搜索参数配置
const searchParamsList = ref<SearchParamType[]>([
  {
    label: "放映厅",
    prop: "screenRoomId",
    type: "select",
    placeholder: "请选择放映厅",
    options: computed(() =>
      screenRoomOptions.value.map((item: any) => ({
        label: item.label,
        value: item.value,
      }))
    ),
  },
  {
    label: "影片",
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
    label: "排片状态",
    prop: "status",
    type: "select",
    placeholder: "请选择排片状态",
    options: shceduleStatusOptions.map((item) => ({
      label: item.label,
      value: item.value,
    })),
  },
  {
    label: "排片日期",
    prop: "scheduleDates",
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

// 生命周期
onActivated(() => {
  getScreenRoomListName();
  initFilmList();
});

import { ElMessageBox } from 'element-plus'
import { onActivated } from "vue";

const confirmPublish = async () => {
  await ElMessageBox.confirm(
    '确认发布选中的排片吗？发布后排片内容将同步至购票平台，用户可查看并购票，且该排片不能被编辑',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  const ids = selectRows.value.map((item) => item.id);
  console.log(selectRows.value, 'selectRows')
  await publishScheduleApi(ids);
  ElMessage.success("发布成功");
  reloadData();
}

const confirmUnPublish = async (row: any) => {
  await ElMessageBox.confirm(
    '确认要取消发布吗？只有距离该影片开场时间大于1天并且没有用户选座购票时才可以取消喔',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  await unPublishScheduleApi(row.id)
  ElMessage.success("取消发布成功");
  reloadData();
}

const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  console.log(searchParams, "searchParams");
  const { scheduleDates = [], filmIds = [], ...restParams } = searchParams;
  const res = await pageQueryScheduleApi({
    ...pageParams,
    ...restParams,
    startDate: scheduleDates[0],
    endDate: scheduleDates[1],
    filmIds: filmIds.join(",") || undefined,
  });

  return {
    data: res.records,
    total: res.total,
  };
};

const initFilmList = async () => {
  const data = (await getValidFilmListApi()) || [];
  filmOptions.value = data.map((item: any) => ({
    ...item,
    label: item.title as string,
    value: item.id,
  }));
};

const showAddDialog = () => {
  actionType.value = "add";
  dialogFormVisible.value = true;
  scheduleForm.value = null;
};

// 方法
const getScreenRoomListName = async (): Promise<void> => {
  const data = await getScreenRoomListApi();
  screenRoomOptions.value = data.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
};

const showEditDialog = (row: ScheduleFormType): void => {
  actionType.value = "update";
  dialogFormVisible.value = true;
  scheduleForm.value = { ...row };
  // scheduleForm.value.startDateTime = `${row.screeningDate}  ${row.startTime}`;
};

const reloadData = () => {
  searchTableTemplateRef.value?.pageQuery();
};

const handleSuccess = (): void => {
  // 刷新表格数据
  reloadData();
};
</script>

<style scoped>
#schedule {
  padding: 20px;
}
</style>
