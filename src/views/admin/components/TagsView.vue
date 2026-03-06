<template>
  <div class="tags-view">
    <el-tabs v-model="active" type="card" closable @tab-click="handleClick" @tab-remove="removeTab">
      <el-tab-pane v-for="tag in visitedViews" :key="tag.path" :label="tag.title" :name="tag.path"
        :closable="visitedViews.length > 1" />
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, watch, computed } from "vue";
import { useTagsViewStore } from "@/stores/tagsView";

const tagsStore = useTagsViewStore();

const visitedViews = ref<any[]>([]); // 这里是标签页显示，不影响缓存
// const visitedViews = ref<any[]>([]); // 这里是标签页显示，不影响缓存
const route = useRoute();
const router = useRouter();

watch(
  () => route.path,
  (newPath) => {
    // 自动加入标签页
    const exist = visitedViews.value.find((v) => v.path === newPath);
    if (!exist) {
      visitedViews.value.push({
        title: route.meta.title,
        path: newPath,
        name: route.name,
      });
    }
    // 自动加入缓存
    tagsStore.addCachedView(route);
    console.log(visitedViews, 'visitedViews')
  },
  { immediate: true }
);

const removeTab = (path: string) => {
  const index = visitedViews.value.findIndex((v) => v.path === path);
  const view = visitedViews.value[index];

  // 删除标签页
  visitedViews.value.splice(index, 1);

  // 删除缓存
  tagsStore.removeCachedView(view);

  // 如果关闭的是当前页，跳转到最后一个标签页
  if (route.path === path) {
    const last = visitedViews.value[index - 1] || visitedViews.value[index];
    if (last) {
      router.push(last.path);
    } else {
      router.push("/"); // 默认首页
    }
  }
};


const active = computed({
  get: () => route.path,
  set: () => { }
});


const handleClick = (tab: any) => {
  router.push(tab.props.name);
};


</script>

<style scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 10px;
}
</style>