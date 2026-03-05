<template>
  <div class="filmContainer">
    <div class="header">
      <span class="title">
        {{ status === 2 ? "正在热映" : "即将上映" }}
        ({{ filmList.length }})
      </span>
      <el-link type="primary" @click="toShowAllFilm()">
        查看全部
        <el-icon>
          <ArrowRight />
        </el-icon>
      </el-link>
    </div>

    <div class="filmBox">
      <template v-for="item in handlefilmList" :key="item.id">
        <FilmCard :film="item" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import FilmCard from '@/components/FilmCard.vue'
import { ArrowRight } from "@element-plus/icons-vue";
// 定义 props
const props = defineProps<{
  filmList: any[]; // 实际项目中建议定义具体的电影数据类型接口
  status: number;
}>();

// 计算属性 - 只显示前8条数据
const handlefilmList = computed(() => {
  return props.filmList.slice(0,8);
});

// 路由跳转
const router = useRouter();
const toShowAllFilm = () => {
  router.push({
    name: "movies",
  });
};
</script>

<style scoped lang="scss">
.filmContainer {
  .header {
    text-align: left;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;

    .title {
      color: rgb(231, 209, 121);
      font-size: 24px;
    }
  }

  .filmBox {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
