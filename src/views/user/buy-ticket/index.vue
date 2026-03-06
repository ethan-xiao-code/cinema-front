<template>
  <base-loading :loading="loading" text="购票数据加载中..." class="buy-ticket-container">
    <film-header :shopType="ShopEnum.Buy" :film="film" @Detail="toFilmDetail" />
    <div class="mainBox">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/user/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>选座购票</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="schedule-date-wrapper" v-if="screeningDateList.length">
        <span class="schedule-label">排片列表</span>
        <el-menu :default-active="activeIndex" class="date-menu" mode="horizontal" @select="handleSelect">
          <el-menu-item :index="dateStr" v-for="dateStr in screeningDateList" :key="dateStr" class="date-menu-item">
            {{ dateStr }}
          </el-menu-item>
        </el-menu>

        <el-table :data="scheduleList" class="schedule-table">
          <el-table-column prop="startTime" label="放映时间">
            <template #default="scope">
              <div class="time-wrapper">
                <div class="start-time">
                  {{ getHandleTime(scope.row.startTime) }}
                </div>
                <div class="end-time">
                  {{ getHandleTime(scope.row.endTime) }} 散场
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="language" label="语言版本"></el-table-column>
          <el-table-column prop="type" label="放映类型">
            <template #default="scope"> {{ getLabelByValue(screenTypeOptions, scope.row.screeningType) }} </template>
          </el-table-column>
          <el-table-column prop="screenRoomName" label="放映厅"></el-table-column>
          <el-table-column label="售价（元）">
            <template #default="scope">
              <span class="price">{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="选座购票">
            <template #default="scope">
              <el-button type="danger" @click="toShowChooseSeat(scope.row)" :disabled="scope.row.status === 1"
                class="buy-btn">
                选座购票
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="empty-wrapper" v-else>
        <el-empty :image-size="200" description="暂无排片"></el-empty>
      </div>
    </div>
  </base-loading>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
// 导入API函数（需确保返回Promise类型）
import { getScheduleDateList, getScheduleListByDate } from "@/api/schedule";
import { getFilmById } from "@/api/film";
import { addCommentApi } from "@/api/comment";
import { Postcard, Reading, Star } from "@element-plus/icons-vue";
import { getLabelByValue, screenTypeOptions } from "@/utils/constant";
import { ShopEnum } from "@/api/film/type";
import FilmHeader from "@/components/FilmHeader.vue";
import { useRequest } from "@/utils/useRequest";
import BaseLoading from "@/components/BaseLoading.vue";

// ========== 类型定义 ==========
// 电影信息类型
interface Film {
  id: string | number;
  poster: string;
  title: string;
  averageScore?: number;
  types: string;
  regions: string;
  duration: number;
  releaseDate: string;
  status: number; // 1:未上映 2:热映
  director?: string;
  actors?: string;
}

// 评论表单类型
interface CommentForm {
  content: string;
  score: number;
  filmId: string | number;
}

// 排片信息类型
interface Schedule {
  id: string | number;
  startTime: string; // 格式：2024-09-24 12:00:00
  endTime: string;
  language: string;
  type: number; // 2/3D
  screenRoomName: string;
  price: number;
  status?: number; // 1:已过期（禁用） 0:可用
}

// ========== 响应式数据 ==========
const route = useRoute();
const router = useRouter();

// 电影ID（从路由参数获取）
const filmId = computed(() => Number(route.params.filmId));

// 电影信息
const film = ref<Film>({
  id: "",
  poster: "",
  title: "",
  types: "",
  regions: "",
  duration: 0,
  releaseDate: "",
  status: 0,
});

// 评分相关
const value = ref<number>(0);
const textArr = ref<string[]>(["非常差", "比较差", "一般般", "比较好", "完美"]);
const dialogVisible = ref<boolean>(false);

// 评论表单
const commentForm = reactive<CommentForm>({
  content: "",
  score: 0,
  filmId: "",
});

// 排片相关
const screeningDateList = ref<string[]>([]); // 排片日期列表
const activeIndex = ref<string>(""); // 当前选中的日期
const scheduleList = ref<Schedule[]>([]); // 排片列表

// ========== 方法定义 ==========
/**
 * 获取单部电影详情
 */
const getSingleFilmById = async () => {
  try {
    const res = await getFilmById(filmId.value);
    film.value = res;
  } catch (error) {
    ElMessage.error("获取电影信息失败");
    console.error("获取电影失败：", error);
  }
};

/**
 * 提交评论
 */
const addComment = async () => {
  if (value.value === 0) {
    ElMessage.error("请选择评分");
    return;
  }

  commentForm.score = value.value;
  commentForm.filmId = filmId.value;

  try {
    await addCommentApi(commentForm);
    ElMessage.success("评价成功");
    cancel();
    getSingleFilmById(); // 刷新电影信息（更新评分）
  } catch (error) {
    ElMessage.error("评价提交失败");
    console.error("提交评论失败：", error);
  }
};

/**
 * 取消评分（重置弹窗）
 */
const cancel = () => {
  value.value = 0;
  commentForm.content = "";
  dialogVisible.value = false;
};

/**
 * 跳转到电影详情页
 */
const toFilmDetail = () => {
  router.push({
    name: "showDetail",
    params: { filmId: filmId.value },
  });
};

/**
 * 获取排片日期列表
 */
const getScheduleDates = async () => {
  try {
    const res = (await getScheduleDateList(filmId.value)) || [];
    res.length && res.sort((a: string, b: string) => {
      // 对放映日期进行升序排序
      return new Date(a).getTime() - new Date(b).getTime();
    });
    screeningDateList.value = [...res];
    // 默认选中第一个日期
    if (res.length) {
      activeIndex.value = screeningDateList.value[0];
      handleSelect(screeningDateList.value[0]);
    }
  } catch (error) {
    ElMessage.error("获取排片日期失败");
    console.error("获取排片日期失败：", error);
  }
};


/**
 * 格式化时间（时分）
 * @param time 时间字符串
 */
const getHandleTime = (time: string) => {
  const d = new Date(time);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * 选择日期后获取对应排片
 * @param scheduleDate 选中的日期
 */
const handleSelect = async (scheduleDate: string) => {
  try {
    const res = await getScheduleListByDate(scheduleDate, filmId.value);
    scheduleList.value = res || [];
    isDisableButton(); // 处理按钮禁用状态
  } catch (error) {
    ElMessage.error("获取排片信息失败");
    console.error("获取排片失败：", error);
  }
};

/**
 * 处理按钮禁用状态（过期场次禁用）
 */
const isDisableButton = () => {
  const now = new Date();
  // 修复原代码的k未定义问题
  scheduleList.value.forEach((item) => {
    const startTime = new Date(item.startTime);
    item.status = now >= startTime ? 1 : 0;
  });
};

/**
 * 跳转到选座页面
 * @param row 排片信息
 */
const toShowChooseSeat = (row: Schedule) => {
  const now = new Date();
  const startTime = new Date(row.startTime);

  if (now >= startTime) {
    ElMessage.error("该影片已经开始啦，请选择下一时间段的影片");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return;
  }

  router.push({
    name: "chooseSeat",
    query: { id: row.id },
  });
};

const getInitData = () => {
  return Promise.allSettled([getSingleFilmById(), getScheduleDates()])
}

const {loading} = useRequest(getInitData,{
  immediate: true
})

// // ========== 生命周期 ==========
// onMounted(async () => {
//   if (filmId.value) {
//     await Promise.allSettled([getSingleFilmById(), getScheduleDates()]);
//   } else {
//     ElMessage.warning("未获取到电影ID");
//     router.push("/user/home");
//   }
// });
</script>

<style scoped lang="scss">
// 根容器
.buy-ticket-container {
  background-color: #fff;
}

// 顶部区域
.top {
  width: 100%;
  height: 280px;
  background: rgb(99, 134, 247);

  .box {
    width: 1200px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center; // 垂直居中
    padding: 0 10px;
  }

  // 海报容器
  .film-poster-wrapper {
    width: 200px;
    height: 260px;
    flex-shrink: 0; // 防止被挤压
  }

  .film-poster {
    width: 100%;
    height: 100%;
    object-fit: cover; // 防止图片变形
    border-radius: 4px;
  }

  // 电影信息区域
  .film-info {
    flex: 1; // 占剩余空间
    height: 260px;
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center; // 垂直居中
    color: white;

    // 电影标题&评分容器（核心：替换float为flex）
    .film-title-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .film-title-text {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }

      // 有评分样式
      .film-score {
        display: flex;
        align-items: center;
        margin-left: 40px;

        .score-rate {
          margin-right: 8px;

          :deep(.el-rate__icon) {
            font-size: 26px;
          }
        }

        .score-value {
          color: rgb(238, 188, 74);
          font-size: 18px;
        }
      }

      // 无评分样式
      .score-empty {
        margin-left: 40px;
        color: rgb(201, 199, 199);
        font-weight: 400;
        font-size: 20px;
      }
    }

    // 电影详情列表
    .film-detail-list {
      display: flex;
      flex-direction: column;
      gap: 8px; // 替代margin，更简洁

      .film-detail-item {
        display: flex;
        align-items: center;

        .detail-label {
          width: 80px;
          flex-shrink: 0; // 固定宽度
          text-align: right;
          margin-right: 8px;
        }
      }
    }

    // 按钮组
    .film-btn-group {
      display: flex;
      gap: 10px; // 按钮间距
      margin-top: 20px;

      .btn {}
    }
  }
}

// 评分弹窗样式
.score-dialog {
  text-align: center;

  .dialog-score-display {
    color: rgb(238, 188, 74);
    height: 30px;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog-rate-wrapper {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .comment-form {
    margin-top: 16px;

    .form-item {
      margin-bottom: 0;

      .comment-input {
        resize: none;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;

    .footer-btn {
      width: 80px;
    }
  }
}

// 中部区域
.mainBox {
  width: 900px;
  margin: 30px auto;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px; // 替代margin-bottom

  // 面包屑
  .breadcrumb {
    font-size: 20px;
  }

  // 排片日期区域
  .schedule-date-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .schedule-label {
      color: rgb(156, 155, 154);
      font-size: 20px;
    }

    // 日期菜单
    .date-menu {
      width: 100%;
    }

    // 排片表格
    .schedule-table {
      width: 100%;

      .time-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .start-time {
          color: black;
          font-size: 20px;
        }

        .end-time {
          font-size: 14px;
          color: #666;
        }
      }

      .price {
        color: red;
        font-size: 18px;
      }

      .buy-btn {
        width: 100px;
      }
    }
  }

  // 空状态
  .empty-wrapper {
    margin-top: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 冗余样式清理
.userContent {
  width: 80%;
}

.filmDate {
  display: inline-block;
  width: 100px;
  margin: 20px;
  text-align: center;

  &:active {
    background: white;
  }
}
</style>
