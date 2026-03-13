<template>
  <SearchTableTemplate ref="searchTableTemplateRef" :extra-params="extraParams" :table-params-list="tableParamsList"
    :search-params-list="searchParamsList" :show-search-form="showSearchForm" :getTableData="getTableData">
    <template #handle>
    </template>
  </SearchTableTemplate>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from "vue";
import { ElButton, ElMessage, ElMessageBox } from "element-plus";
import { accountStatusOptions, userRoleOptions } from "@/utils/constant";
import SearchTableTemplate, { PagerType, SearchParamType, TableParamType } from "@/components/SearchTableTemplate.vue";
import { pageQueryUserApi, updateUserApi } from "@/api/user";
// 响应式数据
const searchTableTemplateRef = ref<typeof SearchTableTemplate>();
defineOptions({
  name: 'adminUsers'
})
const tableParamsList = ref<TableParamType[]>([
  {
    label: "ID",
    prop: "id",
  },
  {
    label: "用户名",
    prop: "username",
    minWidth: 120

  },
  {
    label: "电话号码",
    prop: "phone",
    minWidth: 120

  },
  {
    label: "角色",
    prop: "roleId",
    renderText: (value: number) => {
      return userRoleOptions.find((item: any) => item.value === value)?.label || '';
    },
  },
  {
    label: "账号状态",
    prop: "status",
    renderText: (value: any) => {
      return accountStatusOptions.find((item: any) => item.value === value)
        ?.label || '';
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
    minWidth: 150,
    prop: "option",
    fixed: "right",
    render: (_: any, row: any) => {
      return h("div", { class: "action-buttons" }, [
        h(
          ElButton,
          {
            type: row.status === 0 ? "success" : "danger",
            size: "small",
            onClick: () => openDialog(row),
          },
          () => accountStatusOptions[row.status]?.label
        ),
      ]);
    },
  },
]);

const extraParams = ref({});
const showSearchForm = ref(true);

const searchParamsList = ref<SearchParamType[]>([
  {
    label: "用户名",
    prop: "username",
    type: "input",
    placeholder: "请输入用户名",
  },

  {
    label: "角色",
    prop: "roleId",
    type: "select",
    placeholder: "请选择角色",
    options: userRoleOptions,
  },
  {
    label: "状态",
    prop: "status",
    type: "select",
    placeholder: "请选择账号状态",
    options: accountStatusOptions,
  },
]);

const reloadData = () => {
  searchTableTemplateRef.value?.pageQuery();
};


const openDialog = (row: any) => {
  console.log(row, "row");
  const newStatus = row.status === 0 ? 1 : 0;
  const text =
    newStatus === 1
      ? "确定要启用该用户的账号吗?启用后，账号可以正常使用"
      : "确定要禁用该用户的账号吗？禁用后账号无法使用";
  ElMessageBox.confirm(`${text}`, "状态确认弹框", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      handleUpdate(row, newStatus);
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消状态修改",
      });
    });
};

// 生命周期
onMounted(() => {
});
const getTableData = async (
  pageParams: PagerType,
  searchParams: Record<string, any>
) => {
  const res = await pageQueryUserApi({
    ...pageParams,
    ...searchParams,
  });

  return {
    data: res.records,
    total: res.total,
  };
};



const handleUpdate = async (row: any, status: number) => {
  await updateUserApi({ ...row, status });
  reloadData();
  ElMessage({
    type: "success",
    message: "操作成功",
  });
};
</script>

<style scoped>
.w80 {
  width: 80%;
}
</style>
