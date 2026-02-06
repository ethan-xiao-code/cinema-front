<template>
  <div id="movies">
    <header class="movie-filter-header">
      <!-- 类型筛选 -->
      <div class="filter-nav">
        <span class="filter-label">类型：</span>
        <span class="filter-tag" :class="{ active: activeType < 0 }" @click="selectTypeAll">
          全部
        </span>
        <span v-for="(item, index) in filmTypeList" :key="item" class="filter-tag"
          :class="{ active: activeType === index }" @click="updateTypeColor(index)">
          {{ item }}
        </span>
      </div>

      <!-- 地区筛选 -->
      <div class="filter-nav">
        <span class="filter-label">地区：</span>
        <span class="filter-tag" :class="{ active: activeRegion < 0 }" @click="selectRegionAll">
          全部
        </span>
        <span v-for="(item, index) in filmRegionList" :key="item" class="filter-tag"
          :class="{ active: activeRegion === index }" @click="updateRegionColor(index)">
          {{ item }}
        </span>
      </div>
    </header>

    <!-- 电影列表+分页 -->
    <div v-if="filmList.length" class="movie-list-container">
      <div class="movie-grid">
        <FilmCard v-for="film in filmList" :key="film.id" :film="film" class="movie-card-item" />
      </div>

      <div class="pagination-wrapper">
        <Pager :pageNo="pageNo" :pageSize="pageSize" :total="total" :pageSizes="[18]"
          @changePageNo="handleCurrentChange" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty :image-size="400" description="暂无影片数据，换个筛选条件试试吧～" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { pageQueryFilm } from "@/api/film";
import { throttle } from "lodash-es";
import FilmCard from "@/components/FilmCard.vue";
import Pager from "@/components/Pager.vue";
import { filmRegionList, filmTypeList } from "@/utils/constant";



const route = useRoute();

// 分页相关
const pageSize = ref(18);
const pageNo = ref(1);
const total = ref(0);

// 筛选状态
const activeType = ref(-1);
const activeRegion = ref(-1);

// 电影数据列表
const filmList = ref<any[]>([]);

// 核心查询方法
const pageQueryFilmList = async (title?: string) => {
  const res = await pageQueryFilm({
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    types: activeType.value < 0 ? "" : filmTypeList[activeType.value],
    regions: activeRegion.value < 0 ? "" : filmRegionList[activeRegion.value],
    title,
  });
  filmList.value = res.records || [];
  total.value = res.total || 0;
};

// 类型筛选 - 选择单个
const updateTypeColor = (index: number) => {
  activeType.value = index;
  pageNo.value = 1;
};
// 类型筛选 - 选择全部
const selectTypeAll = () => {
  activeType.value = -1;
  pageNo.value = 1;
};

// 地区筛选 - 选择单个
const updateRegionColor = (index: number) => {
  activeRegion.value = index;
  pageNo.value = 1;
};
// 地区筛选 - 选择全部
const selectRegionAll = () => {
  activeRegion.value = -1;
  pageNo.value = 1;
};

// 分页切换
const handleCurrentChange = (val: number) => {
  pageNo.value = val;
  // 平滑滚动到顶部，替代生硬的scrollTop
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 初始化查询
onMounted(() => {
  // pageQueryFilmList();
});

watch([pageNo,pageSize,activeRegion,activeType],(data) => {
  pageQueryFilmList();
})


watch(
  () => route.query.filmTitle, // 搜索影片标题变化时，会触发查询
  (newVal) => {
    const title = newVal?.toString();
    console.log(title,'title')
    pageNo.value = 1;
    pageQueryFilmList(title);
  },
  { immediate: true }
);


</script>

<style scoped lang="scss">
// 根容器：基础布局+背景，适配中等屏幕，避免溢出
#movies {
  max-width: 1200px; // 最大宽度，小屏自动收缩
  width: 95%; // 适配小屏，左右留边
  margin: 20px auto; // 上下间距，左右居中
  padding: 24px;
  background-color: #f4f6f8;
  border-radius: 12px; // 轻微圆角，更柔和
  box-sizing: border-box; // 内边距不撑大宽度
}

// 筛选头部：弹性布局，适配内容高度
.movie-filter-header {
  display: flex;
  flex-direction: column;
  gap: 16px; // 两个筛选栏的垂直间距
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb; // 分割线，区分筛选和列表
}

// 单个筛选导航
.filter-nav {
  display: flex;
  align-items: center;
  gap: 12px; // 标签之间的间距
  flex-wrap: wrap; // 标签过多时自动换行，不溢出
}

// 筛选标签文字
.filter-label {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap; // 不换行
}

// 筛选标签按钮
.filter-tag {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #374151;
  background-color: #fff;
  border-radius: 16px; // 圆形标签，和高度匹配
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease; // 过渡动画，hover/active更丝滑
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // 轻微阴影，提升质感

  &:hover {
    background-color: #fef2f2; // hover浅红背景，和主色呼应
    color: #dc2626;
  }

  &.active {
    background-color: #dc2626; // 柔和红，替代纯红
    color: #fff;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15); // 激活态阴影
  }
}

// 电影列表容器
.movie-list-container {
  width: 100%;
}

// 电影网格布局：6列，自适应间距
.movie-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px; // 行列统一间距，替代grid-gap（已废弃）
  margin-bottom: 32px; // 和分页的间距
}

// 电影卡片项：基础样式，可配合子组件
.movie-card-item {
  width: 100%;
  box-sizing: border-box;
}

// 分页容器：居中对齐
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
}

// 空状态容器：居中，适配页面高度
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  min-height: 400px; // 最小高度，避免页面过矮
}
</style>