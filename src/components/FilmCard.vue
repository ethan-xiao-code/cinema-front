<template>
  <div class="filmItem">
    <img 
      :src="film.poster" 
      class="poster" 
      @click="toShowFilmDetail(film.id)"
      alt="电影海报"
    >
    <div class="buyBtn" @click="toBuyFilm(film.id)">购票</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { FilmCardType } from "@/api/film/type";

type PropsType = {
  film: FilmCardType
}

const props = defineProps<PropsType>();

// ========== 路由实例 ==========
const router = useRouter();

// ========== 方法定义 ==========
/**
 * 跳转到购票页面
 * @param filmId 电影ID
 */
const toBuyFilm = (filmId: string | number) => {
  router.push({
    name: "buy",
    params: { filmId },
  });
};

/**
 * 跳转到电影详情页
 * @param filmId 电影ID
 */
const toShowFilmDetail = (filmId: string | number) => {
  router.push({
    name: "showDetail",
    params: { filmId },
  });
};
</script>

<style lang="scss" scoped>
.filmItem {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease; // 添加强制动画过渡

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transform: scale(1.1);
    .poster {
      height: 100%;
    }
  }

  .poster {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover; // 防止图片变形
  }

  .buyBtn {
    width: 100%;
    height: 40px;
    font-size: 16px;
    color: red;
    background-color: #fff;
    border: 1px solid #e7e7e7;
    border-top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease; // 按钮hover动画
    &:hover {
      background-color: red;
      color: white;
    }
  }
}
</style>