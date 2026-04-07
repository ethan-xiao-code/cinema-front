<template>
  <div id="commentList">
    <SearchTableTemplate ref="searchTableTemplateRef" :table-params-list="tableParamsList" :table-props="tableProps"
      :search-params-list="searchParamsList" :get-table-data="getTableData" :show-search-form="true"
      tree-children-key="replies" :load-children="loadReplies">
    </SearchTableTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onActivated } from 'vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import SearchTableTemplate, {
  PagerType,
  SearchParamType,
  TableParamType,
} from '@/components/SearchTableTemplate.vue'
import {
  pageQueryCommentApi,
  adminDeleteCommentApi,
  getRepliesByParentIdApi,
} from '@/api/comment'
import { getValidFilmListApi } from '@/api/film'
import { useRequest } from '@/utils/useRequest'

defineOptions({ name: 'adminCommentList' })

const searchTableTemplateRef = ref<any>(null)
const filmOptions = ref<{ label: string; value: any }[]>([])

// ===================== 懒加载子回复 =====================
const loadReplies = async (row: any, _treeNode: any, resolve: (data: any[]) => void) => {
  try {
    const replies = await getRepliesByParentIdApi(row.id)
    resolve(replies || [])
  } catch (error) {
    console.error('加载子回复失败:', error)
    resolve([])
  }
}

// ===================== 表格配置 =====================
const tableProps = {
  rowKey: 'id',
  lazy: true,
  load: loadReplies,
  treeProps: {
    children: 'replies',
    hasChildren: 'hasReplies',
  },
}


// ===================== 数据请求 =====================
const getTableData = async (pageParams: PagerType, searchParams: Record<string, any>) => {
  const res = await pageQueryCommentApi({
    page: pageParams.pageNo,
    pageSize: pageParams.pageSize,
    ...searchParams
  })
  const data = (res.records || []).map((item: any) => ({
    ...item,
    hasChildren: item.replyCount > 0,
  }))
  return { data, total: res.total }
}

// ===================== 表格列配置 =====================
const tableParamsList = ref<TableParamType[]>([
  { label: '评论ID', prop: 'id', width: 90 },
  {
    label: '影片名',
    prop: 'filmName',
    minWidth: 120,
    renderText: (value: any) => {
      return value || '-'
    },
  },
  { label: '用户名', prop: 'username', minWidth: 100 },
  {
    label: '评分',
    prop: 'score',
    width: 80,
    render: (value: number | null) => {
      if (!value) return h('span', { style: 'color:#999' }, '—')
      return h('span', { style: 'color:#edbc48;font-weight:600' }, `${(value * 2).toFixed(1)}`)
    },
  },
  { label: '评论内容', prop: 'content', minWidth: 220, attrs: { showOverflowTooltip: true } },
  { label: '点赞数', prop: 'likes', width: 80 },
  { label: '点踩数', prop: 'unLikes', width: 80 },
  { label: '发布时间', prop: 'createdTime', minWidth: 160 },
  {
    label: '操作',
    prop: 'option',
    width: 100,
    fixed: 'right',
    render: (_: any, row: any) =>
      h(ElButton, {
        type: 'danger', size: 'small',
        onClick: () => handleDelete(row)
      }, () => '删除'),
  },
])

// ===================== 搜索配置 =====================
const searchParamsList = ref<SearchParamType[]>([
  {
    label: '影片名',
    prop: 'filmId',
    type: 'select',
    options: computed(() => filmOptions.value),
    attrs: { placeholder: '请选择影片', clearable: true, filterable: true },
  },
  {
    label: '评论内容',
    prop: 'content',
    type: 'input',
    placeholder: '请输入关键词',
  },
])

// ===================== 删除 =====================
const handleDelete = async (row: any) => {
  const msg = row.parentId === -1
    ? '删除该评论将同时删除其所有回复，确认删除吗？'
    : '确认删除该回复吗？'
  await ElMessageBox.confirm(msg, '评论删除提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await adminDeleteCommentApi(row.id)
  ElMessage.success('删除成功')
  searchTableTemplateRef.value?.pageQuery()
}

// ===================== 初始化 =====================
const { runFn: initFilmList } = useRequest(getValidFilmListApi, {
  onSuccess: (data) => {
    filmOptions.value = (data || []).map((item: any) => ({ label: item.title, value: item.id }))
  },
})

onActivated(() => {
  initFilmList()
})
</script>

<style scoped lang="scss"></style>
