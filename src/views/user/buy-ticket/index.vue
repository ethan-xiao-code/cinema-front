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
import { getScheduleDateListApi, getScheduleListByDateApi } from "@/api/schedule";
import { getFilmByIdApi } from "@/api/film";
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


// 排片相关
const screeningDateList = ref<string[]>([]); // 排片日期列表
const activeIndex = ref<string>(""); // 当前选中的日期
const scheduleList = ref<Schedule[]>([]); // 排片列表

// ========== 方法定义 ==========



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

/**
 * 获取单部电影详情
 */
const getSingleFilmById = async () => {
  const res = await getFilmByIdApi(filmId.value);
  film.value = res;
};

/**
 * 选择日期后获取对应排片
 * @param scheduleDate 选中的日期
 */
const handleSelect = async (scheduleDate: string) => {
    const res = await getScheduleListByDateApi(scheduleDate, filmId.value);
    scheduleList.value = res || [];
    isDisableButton(); // 处理按钮禁用状态
};

/**
 * 获取排片日期列表
 */
const getScheduleDates = async () => {
  const res = (await getScheduleDateListApi(filmId.value)) || [];
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
};


const getInitData = () => {
  return Promise.allSettled([getSingleFilmById(), getScheduleDates()])
}

const { loading } = useRequest(getInitData, {
  immediate: true
})


</script>

<style scoped lang="scss">
.buy-ticket-container {
  background-color: #fff;

  .mainBox {
    width: 900px;
    margin: 30px auto;
    padding-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;

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

      .date-menu {
        width: 100%;

        .date-menu-item {
          text-align: center;
          width: 100px;
          margin: 0 10px;
        }
      }

      .schedule-table {
        width: 100%;

        .time-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .start-time {
            font-size: 20px;
            color: #000;
          }

          .end-time {
            font-size: 14px;
            color: #666;
          }
        }

        .price {
          font-size: 18px;
          color: red;
        }

        .buy-btn {
          width: 100px;
        }
      }
    }

    .empty-wrapper {
      margin-top: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

// 其他零散样式
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
