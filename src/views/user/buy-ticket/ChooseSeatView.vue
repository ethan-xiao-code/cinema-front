<template>
  <div id="seat">
    <!-- 步骤条 -->
    <el-steps :active="2" align-center class="steps">
      <el-step title="选择场次" description="选择电影和放映时间" />
      <el-step title="选择座位" description="挑选心仪的座位" />
      <el-step title="确认订单" description="加入购物车并在15分钟内付款" />
      <el-step title="完成支付" description="支付成功，购票完成" />
    </el-steps>

    <div class="seat-container">
      <!-- 左侧信息 -->
      <div class="left-panel">
        <div class="film-card">
          <img :src="filmSchedule.poster" class="film-poster" />
          <div class="film-detail">
            <h2 class="film-title">{{ filmSchedule.title }}</h2>
            <div class="film-meta">
              <span class="meta-item">类型：{{ filmSchedule.filmTypes }}</span>
              <span class="meta-item"
                >地区：{{ filmSchedule.filmRegions }}</span
              >
              <span class="meta-item"
                >时长：{{ filmSchedule.duration }} 分钟</span
              >
              <span class="meta-item"
                >{{
                  getLabelByValue(screenTypeOptions, filmSchedule.scheduleType)
                }}
                放映</span
              >
            </div>
          </div>
        </div>

        <div class="schedule-info">
          <div class="info-item">
            <span class="label">开场时间：</span>
            <span class="value highlight">{{ filmSchedule.startTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">散场时间：</span>
            <span class="value">{{ filmSchedule.endTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">单座票价：</span>
            <span class="value">￥{{ filmSchedule.price.toFixed(2) }}/张</span>
          </div>
        </div>

        <div class="selected-seats">
          <span class="title">已选座位：</span>
          <div class="tag-group">
            <div
              v-for="seat in selectSeatNumbers"
              :key="seat"
              type="success"
              class="seat-tag"
              size="small"
            >
              {{ seat }}号
            </div>
            <span v-if="!selectSeatNumbers.length" class="empty-tip"
              >暂未选择座位</span
            >
          </div>
        </div>

        <div class="total-price">
          <span class="label">总计金额：</span>
          <span class="price">￥{{ totalPrice }}</span>
        </div>

        <el-input
          v-model="phone"
          placeholder="请输入11位手机号"
          class="phone-input"
          clearable
          maxlength="11"
          show-word-limit
        />
        <el-button
          type="danger"
          class="add-cart-btn"
          @click="saveCart"
          size="large"
        >
          加入购物车
        </el-button>
      </div>

      <!-- 右侧座位 -->
      <div class="right-panel">
        <div class="seat-selector">
          <!-- 图例 -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-color noSelected"></span>
              <span class="legend-text">可选</span>
            </div>
            <div class="legend-item">
              <span class="legend-color isOtherUserSelected"></span>
              <span class="legend-text">他人已选</span>
            </div>
            <div class="legend-item">
              <span class="legend-color isSelected"></span>
              <span class="legend-text">您已选</span>
            </div>
            <div class="legend-item">
              <span class="legend-color cartSeat"></span>
              <span class="legend-text">已加购物车</span>
            </div>
            <div class="legend-item">
              <span class="legend-color selledSeat"></span>
              <span class="legend-text">已售出</span>
            </div>
          </div>

          <!-- 屏幕 -->
          <div class="screen-wrapper">
            <div class="screen"></div>
            <p class="screen-tip">银幕中央</p>
          </div>

          <!-- 座位表 -->
          <div class="seats-wrapper">
            <div
              v-for="(row, rowIndex) in seatDatas"
              :key="row[0].number"
              class="seat-row"
            >
              <span
                v-for="(seat, seatIndex) in row"
                :key="seat.number"
                :class="getSeatClass(seat)"
                @click="handleChooseSeat(seat)"
                class="seat-item"
              >
                {{ seat.number }}
              </span>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="simulateConcurrentClicks"
          >模拟多用户抢座</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores";

import { getFilmAndScheduleById } from "@/api/schedule";
import { getSeatsByScheduleId, deleteSeatById } from "@/api/seat";
import { addCart } from "@/api/cart";
import { useWebSocket } from "@/utils/useWebSocket";
import { getLabelByValue, screenTypeOptions } from "@/utils/constant";

// ========== 类型 ==========
interface SeatType {
  scheduleId: number;
  userId: number;
  number: number;
  status: number; // 0:未选 1:已选 2:已加入购物车 3:已售
  isCurrentUser: boolean; // true:当前用户选 false:其他用户
}

interface FilmSchedule {
  title: string;
  poster: string;
  filmTypes: string;
  filmRegions: string;
  duration: number;
  scheduleType: number;
  startTime: string;
  endTime: string;
  price: number;
  seatCount: number;
}

// ========== 路由与用户 ==========
const route = useRoute();
const userStore = useUserStore();

const scheduleId = computed(() => route.query.id);

// ========== 响应式 ==========
const filmSchedule = reactive<FilmSchedule>({
  title: "",
  poster: "",
  filmTypes: "",
  filmRegions: "",
  duration: 0,
  scheduleType: 0,
  startTime: "",
  endTime: "",
  price: 0,
  seatCount: 0,
});

enum SeatStatus {
  None = 0, // 未选
  Selected = 1, // 已选
  Cart = 2, // 已加入购物车
  Selled = 3, // 已售
}

enum UserFlag {
  Other = 0,
  Current = 1,
}

const seatDatas = ref<SeatType[][]>([]); // 渲染的座位数据
const selectSeatNumbers = ref<number[]>([]); // 选择的座位号
const totalPrice = ref(0); // 选择座位的总价格
const phone = ref("");

// ========== 方法 ==========
/** 初始化座位表 */
const initSeats = () => {
  const rows: SeatType[][] = [];
  let row: SeatType[] = [];
  for (let i = 1; i <= filmSchedule.seatCount; i++) {
    row.push({
      number: i,
      status: 0,
      isCurrentUser: false,
      scheduleId: Number(scheduleId.value),
      userId: userStore.userId,
    });
    if (i % 12 === 0) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push(row);
  seatDatas.value = rows;
};

const seatMap = computed(() => {
  const flatSeats = seatDatas.value.flat();
  return new Map(flatSeats.map((item) => [item.number, item]));
});

/** 更新座位状态 */
const handleSeat = (list: SeatType[]) => {
  list.forEach((item) => {
    const seat = seatMap.value.get(item.number);
    if (!seat) return;

    const isCurUser = item.userId === userStore.userId;

    // 保证当前座位只有当前用户可以操作，其他用户不能操作
    if (seat.isCurrentUser && seat.status === 1 && !isCurUser) {
      return;
    }

    seat.status = item.status;
    seat.isCurrentUser = isCurUser;
  });
  calculateSeats();
};

/** 计算已选座位及总价 */
const calculateSeats = () => {
  const selected = seatDatas.value
    .flat()
    .filter((seat) => seat.status === 1 && seat.isCurrentUser)
    .map((s) => s.number);
  selectSeatNumbers.value = selected;
  totalPrice.value = Number((selected.length * filmSchedule.price).toFixed(2));
};

const handleWsMessage = (msg: SeatType[] | SeatType) => {
  console.log(msg, "msg");
  // 服务器推送座位信息
  let data = [msg];

  handleSeat(data.flat());
};
const { initWebSocket, send, close } = useWebSocket(
  `/ws/seat`,
  handleWsMessage,
  {
    scheduleId: scheduleId.value,
  },
);

// 模拟并发用户点击
const simulateConcurrentClicks = async () => {
  const testSeats = [1, 2, 3]; // 要测试的座位号
  const users = [3, 8, 4]; // 模拟三个不同用户ID

  for (let i = 0; i < testSeats.length; i++) {
    const seatNumber = testSeats[i];

    const seat = seatMap.value.get(seatNumber);

    if (!seat) continue;
    users.forEach((userId) => {
      console.log(`用户 ${userId} 点击座位 ${seat.number}`);
      handleChooseSeat({
        ...seat,
        userId,
      });
    });
  }
};

onMounted(() => {
  getFilmSchedule();
  initWebSocket();
});
/** 获取排片信息 */
const getFilmSchedule = async () => {
  const res = await getFilmAndScheduleById({ scheduleId: scheduleId.value });
  Object.assign(filmSchedule, res);
  initSeats();
  getSeatList();
};

/** 获取座位信息 */
const getSeatList = async () => {
  const data = await getSeatsByScheduleId({ scheduleId: scheduleId.value });
  handleSeat(data);
};

/** 选择/取消座位 */
const handleChooseSeat = async (seat: SeatType) => {
  if (seat.status === 3) return ElMessage.error("不能选择已售座位");
  if (seat.status === 2 && seat.isCurrentUser)
    return ElMessage.error("不能选择已加入购物车的座位");
  if ((seat.status === 1 || seat.status === 2) && !seat.isCurrentUser)
    return ElMessage.error("不能选择其他用户已选择的座位");

  if (seat.status === 0) {
    send({
      number: seat.number,
      status: 1,
      userId: seat.userId,
      scheduleId: scheduleId.value,
    });
  } else if (seat.status === 1 && seat.isCurrentUser) {
    send({
      number: seat.number,
      status: 0,
      userId: seat.userId,
      scheduleId: scheduleId.value,
    });
  }

  // calculateSeats();
};

/** 加入购物车 */
const saveCart = async () => {
  if (!selectSeatNumbers.value.length) return ElMessage.error("请选择座位");
  if (!phone.value || phone.value.length !== 11)
    return ElMessage.error("请输入11位手机号");

  await addCart({
    scheduleId: scheduleId.value,
    title: filmSchedule.title,
    poster: filmSchedule.poster,
    price: filmSchedule.price,
    selectSeatNumbers: selectSeatNumbers.value,
    phone: phone.value,
    startTime: filmSchedule.startTime,
  });
  ElMessage.success("加入购物车成功，请在15分钟内完成付款");
  await getSeatList();
};

/** 获取座位样式 */
const getSeatClass = (seat: SeatType) => {
  if (seat.status === SeatStatus.Selled) {
    return "selledSeat"; // 已售
  }

  if (seat.status === SeatStatus.Cart && seat.isCurrentUser) {
    return "cartSeat"; // 当前用户已加购物车
  }

  if (seat.status === SeatStatus.Selected && seat.isCurrentUser) {
    return "isSelected"; // 当前用户已选
  }

  if (
    (seat.status === SeatStatus.Selected || seat.status === SeatStatus.Cart) &&
    !seat.isCurrentUser
  ) {
    return "isOtherUserSelected"; // 他人已选 / 他人购物车
  }

  return "noSelected"; // 可选
};

onUnmounted(() => {
  close?.();
});
</script>

<style lang="scss" scoped>
#seat {
  min-width: 1000px;
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 24px 16px;
  box-sizing: border-box;

  // 步骤条样式优化
  .steps {
    max-width: 1200px;
    margin: 0 auto 32px;
    padding: 0 16px;

    :deep(.el-steps) {
      --el-steps-process-text-color: #e53e3e;
      --el-steps-process-border-color: #e53e3e;
      --el-steps-process-icon-color: white;
      --el-steps-process-bg-color: #e53e3e;
    }

    :deep(.el-step__title) {
      font-size: 15px;
      font-weight: 500;
    }

    :deep(.el-step__description) {
      font-size: 12px;
      color: #718096;
      margin-top: 4px;
    }
  }

  // 主容器
  .seat-container {
    display: flex;
    // gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
    align-items: flex-start;

    // 左侧信息面板
    .left-panel {
      width: 300px;
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
      margin-left: 32px;
      // 电影信息卡片
      .film-card {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #edf2f7;

        .film-poster {
          width: 100px;
          height: 140px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .film-detail {
          flex: 1;
          text-align: left;
          .film-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 12px;
            line-height: 1.4;
          }

          .film-meta {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .meta-item {
              font-size: 13px;
              color: #718096;
              line-height: 1.5;
            }
          }
        }
      }

      // 排期信息
      .schedule-info {
        margin-bottom: 20px;

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;

          .label {
            color: #718096;
          }

          .value {
            color: #2d3748;
            font-weight: 500;

            &.highlight {
              color: #e53e3e;
              // font-weight: 600;
            }
          }
        }
      }

      // 已选座位
      .selected-seats {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc; // 极浅的底色区分区域
        border-radius: 12px; // 更圆润的现代感
        border: 1px solid #edf2f7;

        .title {
          display: block;
          font-size: 14px;
          color: #2d3748; // 深灰文字增加质感
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.02em;
        }

        .tag-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          min-height: 32px;

          .seat-tag {
            border-radius: 6px;
            width: 45px;
            padding: 5px 0;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            // cursor: pointer;
            background-color: #48bb78 !important;
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(72, 187, 120, 0.2);
          }

          .empty-tip {
            font-size: 13px;
            color: #a0aec0;
            font-style: normal; // 去除斜体，现代设计较少使用斜体做提示
            display: flex;
            align-items: center;
          }
        }
      }

      // 总价
      .total-price {
        margin-bottom: 20px;
        padding: 12px;
        background-color: #f7fafc;
        border-radius: 8px;

        .label {
          font-size: 14px;
          color: #718096;
        }

        .price {
          font-size: 20px;
          color: #e53e3e;
          font-weight: 700;
          margin-left: 8px;
        }
      }

      // 手机号输入框
      .phone-input {
        width: 100%;
        margin-bottom: 16px;

        :deep(.el-input__wrapper) {
          border-radius: 8px;
          padding: 0 16px;
          height: 48px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #edf2f7;

          &:focus-within {
            border-color: #e53e3e;
            box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.1);
          }
        }
      }

      // 加入购物车按钮
      .add-cart-btn {
        width: 100%;
        height: 50px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        background-color: #e53e3e;
        border: none;

        &:hover {
          background-color: #d32f2f;
        }

        &:disabled {
          background-color: #cbd5e0;
          cursor: not-allowed;
        }
      }
    }

    // 右侧选座面板
    .right-panel {
      flex: 1;
      box-sizing: border-box;
      .seat-selector {
        width: 100%;
        margin-bottom: 60px;
        // 图例
        .legend {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #edf2f7;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #4a5568;

            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 4px;
              display: inline-block;
            }

            .legend-text {
              color: #718096;
            }
          }
        }

        // 屏幕样式
        .screen-wrapper {
          text-align: center;
          margin-bottom: 32px;

          .screen {
            width: 70%;
            height: 20px;
            background: linear-gradient(to right, #e2e8f0, #cbd5e0, #e2e8f0);
            border-radius: 8px 8px 0 0;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .screen-tip {
            margin-top: 8px;
            font-size: 13px;
            color: #718096;
          }
        }

        // 座位区域
        .seats-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 16px;

          .seat-row {
            display: flex;
            justify-content: center;
            gap: 8px;

            .seat-item {
              width: 38px;
              height: 38px;
              line-height: 38px;
              text-align: center;
              cursor: pointer;
              border-radius: 6px;
              font-size: 15px;
              font-weight: 500;
              transition: all 0.2s ease;
              user-select: none;

              &:hover {
                transform: scale(1.08);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }

              // 禁用hover效果的状态
              &.selledSeat,
              &.isOtherUserSelected,
              &.cartSeat {
                cursor: not-allowed;

                &:hover {
                  transform: none;
                  box-shadow: none;
                }
              }
            }
          }
        }
      }
    }
  }
}

/* 1. 可选座位：清爽的灰色微凹感 */
.noSelected {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  color: #909399;
}

/* 2. 当前用户选中：高亮森林绿 (成功感) */
.isSelected {
  background: #27ae60 !important; /* 加深绿色 */
  color: white;
}

/* 3. 其他用户选中：深沉的琥珀橙 (警示不可选) */
.isOtherUserSelected {
  background: #f39c12 !important; /* 提高饱和度 */
  color: white;
}

/* 4. 已加入购物车：商务深蓝 (待处理感) */
.cartSeat {
  background: skyblue !important;
  color: white;
}

.selledSeat {
  background: red !important;
  color: white;
}
</style>
