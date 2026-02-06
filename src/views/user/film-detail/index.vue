<template>
  <div class="filmDetailModule">
    <!-- 头部 -->
    <FilmHeader :shopType="ShopEnum.Detail" :film="film" @buy="toBuyFilm" @rate="toRate" />

    <div class="mainBox">
      <el-breadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/user/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>电影详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="desc">
        <h3>剧情简介</h3>
        <p class="plot">{{ film.plot }}</p>
      </div>
      <div>
        <h3>电影评论</h3>

        <UserCommentModule v-if="isLogin" />
        <el-empty v-else :image-size="200" description="登录后查看用户评论"></el-empty>
      </div>
    </div>

    <AddCommentDialog v-if="dialogVisible" v-model:dialogVisible="dialogVisible" :commentValue="commentForm"
      @submit="saveComment" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
// 导入API函数（需确保API返回Promise类型）
import {
  addCommentApi,
  getCommentByFilmAndUserIdApi,
  getCommentByFilmIdApi,
} from "@/api/comment";
import { getFilmById } from "@/api/film";
import { ShoppingCart, Star } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import AddCommentDialog from "./components/AddCommentDialog.vue";
import { CommentFormType } from "@/api/comment/type";
import { FilmType, ShopEnum } from "@/api/film/type";
import UserCommentModule from "./components/UserCommentModule.vue";
import FilmHeader from "@/components/FilmHeader.vue";

const route = useRoute();
const router = useRouter();

// 电影ID（从路由参数获取）
const filmId = computed(() => Number(route.params.filmId));

// 电影信息（初始化为空对象，指定类型）
const film = ref<FilmType>({
  id: 0,
  poster: "",
  title: "",
  director: "",
  actors: "",
  types: "",
  regions: "",
  duration: 0,
  releaseDate: "",
  status: 1,
  plot: "",
  averageScore: 0,
});

const dialogVisible = ref<boolean>(false); // 评分弹窗显隐

// 评论表单
const commentForm = ref<CommentFormType | null>(null);

const userStore = useUserStore();


const isLogin = computed(() => {
  return !!userStore?.token;
});

// ========== 方法定义 ==========
// 获取电影和评论数据
const getNewFilmInfo = async () => {
  // 获取电影详情
  const filmRes = await getFilmById(filmId.value);
  film.value = filmRes;

  // // 获取评论列表
  // const commentRes = await getCommentByFilmIdApi(filmId.value);
  // userList.value = commentRes;
};

const toRate = async () => {
  if (!isLogin.value) {
    return ElMessage.warning("只有登录后的用户才可以评分噢~");
  }
  const data = await getCommentByFilmAndUserIdApi({
    filmId: filmId.value,
    userId: userStore.userId,
  });
  commentForm.value = data;
  dialogVisible.value = true;
};

// 保存评论
const saveComment = async (values: any) => {
  const userId = userStore.userId;
  await addCommentApi({
    ...values,
    filmId: filmId.value,
    userId,
  });
  dialogVisible.value = false;
  ElMessage.success("评价成功");
  getNewFilmInfo(); // 重新加载评论
};

// 跳转到购票页面
const toBuyFilm = () => {
  router.push({
    name: "buy",
    params: {
      filmId: filmId.value,
    },
  });
};


// ========== 生命周期 ==========
// 组件挂载时加载数据（替代created）
onMounted(() => {
  filmId.value && getNewFilmInfo();
});
</script>

<style scoped lang="scss">
$width: 900px;

.filmDetailModule {
  padding: 0 30px;

  .mainBox {
    text-align: left;
    width: $width;
    margin: 30px auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-size: 16px;

    .breadcrumb {
      font-size: 20px;
    }

    .desc {
      .plot {
        margin-top: 10px;
        line-height: 1.5;
        font-size: 16px;
      }
    }

    .userContent {
      color: rgb(199, 199, 199);
      display: flex;
      justify-content: space-between;

      .left {
        flex: 1;

        .avater {
          float: left;
          width: 60px;
          height: 60px;
          margin-right: 10px;
        }

        .username {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
