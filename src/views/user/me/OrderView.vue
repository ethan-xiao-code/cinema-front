<template>
  <div id="order">
    <div class="order-container">
      <h2 class="page-title">我的订单</h2>

      <!-- 订单列表 -->
      <div v-if="orderArr.length > 0" class="order-list">
        <div class="order-item" v-for="order in orderArr" :key="order.id">
          <!-- 订单海报 -->
          <div class="order-poster">
            <img :src="order.poster" alt="电影海报" class="poster-img" loading="lazy">
          </div>

          <!-- 订单主要信息 -->
          <div class="order-main">
            <h3 class="film-name">{{ order.filmName }}</h3>
            <div class="order-info">
              <span class="info-item">放映厅：{{ order.screenRoomName }}</span>
              <span class="info-item">座位：{{ order.seatNumberStr }} 号</span>
            </div>
            <div class="order-time">
              <span class="time-label">开场时间：</span>
              <span class="start-time">{{ order.startTime }}</span>
            </div>
            <div class="order-time">
              <span class="time-label">支付时间：</span>
              <span class="pay-time">{{ order.payTime }}</span>
            </div>
          </div>

          <!-- 订单操作区域 -->
          <div class="order-actions">
            <div class="order-amount">¥{{ order.amount.toFixed(2) }}</div>
            <el-tag :type="typeArr[order.status]" class="status-tag">
              {{ payStatus[order.status] }}
            </el-tag>
            <el-button :disabled="order.status !== 1 || isOrderExpired(order.startTime)" type="danger" size="default"
              class="cancel-btn" @click="cancelOrders(order)">
              取消订单
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空订单状态 -->
      <div v-else class="empty-order">
        <el-empty :image-size="200" description="这里空空如也，快去下单吧～"></el-empty>
        <el-button type="primary" class="go-order-btn" @click="$router.push('/user/home')">
          去购票
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus'
import { getOrdersList, cancelOrders } from "@/api/orders";

// ========== 类型定义 ==========
interface OrderItem {
  id: number;
  filmName: string;
  poster: string;
  screenRoomName: string;
  seatNumberStr: string | number;
  startTime: string;
  payTime: string;
  amount: number;
  status: number;
  scheduleId?: number;
}

// ========== 常量定义 ==========
// 支付状态映射（替代原 $constant.payStatus）
const payStatus = {
  0: '已取消',
  1: '待观影',
  2: '已完成'
}

// 标签类型映射
const typeArr = ['danger', 'warning', 'success']

// ========== 响应式变量 ==========
const orderArr = ref<OrderItem[]>([])

// ========== 生命周期 ==========
onMounted(async () => {
  await getOrdersByUserId()
})

// ========== 方法定义 ==========
/** 获取用户订单列表 */
const getOrdersByUserId = async () => {
  try {
    const res = await getOrdersList()
    orderArr.value = res || []
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error(error)
  }
}

/** 判断订单是否过期（开场时间已过） */
const isOrderExpired = (startTime: string) => {
  return new Date(startTime) < new Date()
}

/** 取消订单 */
const cancelOrders = async (order: OrderItem) => {
  // 先判断订单是否过期
  if (isOrderExpired(order.startTime)) {
    ElMessage.error("取消失败,请在影片播放前取消订单！")
    return
  }

  try {
    await ElMessageBox.confirm(
      "此操作将取消该订单, 是否继续?",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    )

    await cancelOrders(order.id)
    await getOrdersByUserId() // 刷新订单列表
    ElMessage.success("取消成功!")
  } catch (error) {
    // 取消操作不提示信息
  }
}
</script>

<style lang="scss" scoped>
#order {
  background-color: #FFF;

  // font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  .order-container {

    // 页面标题
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #212529;
      padding-bottom: 24px;

    }

    // 订单列表
    .order-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    // 单个订单项
    .order-item {
      display: flex;
      align-items: center;
      width: 100%;
      height: 140px;
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 0 20px;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      // 订单海报
      .order-poster {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        flex-shrink: 0;

        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          vertical-align: middle;
        }
      }

      // 订单主要信息
      .order-main {
        flex: 1;
        margin-left: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .film-name {
          font-size: 18px;
          font-weight: 600;
          color: #212529;
          margin: 0 0 12px 0;
        }

        .order-info {
          display: flex;
          gap: 24px;
          margin-bottom: 8px;

          .info-item {
            font-size: 14px;
            color: #495057;
          }
        }

        .order-time {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #868e96;
          margin-bottom: 4px;

          .time-label {
            color: #6c757d;
            margin-right: 8px;
          }

          .start-time {
            color: #e74c3c;
            font-weight: 500;
          }

          .pay-time {
            color: #495057;
          }
        }
      }

      // 订单操作区域
      .order-actions {
        width: 350px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;

        .order-amount {
          font-size: 18px;
          font-weight: 700;
          color: #e74c3c;
        }

        .status-tag {
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .cancel-btn {
          height: 40px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 14px;

          &:disabled {
            background-color: #f5f5f5;
            border-color: #e9ecef;
            color: #c0c4cc;
            cursor: not-allowed;
          }
        }
      }
    }

    // 空订单状态
    .empty-order {
      text-align: center;
      padding: 80px 0;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      .go-order-btn {
        margin-top: 30px;
        padding: 12px 40px;
        font-size: 16px;
        border-radius: 8px;
        background-color: #409eff;
        border: none;
      }
    }
  }
}

// 重置默认样式
p,
h3,
h2 {
  margin: 0;
  padding: 0;
}

// 重置Element样式
:deep(.el-empty__description) {
  font-size: 16px;
  color: #868e96;
}

:deep(.el-tag) {
  --el-tag-padding: 6px 12px;
}

:deep(.el-button--danger) {
  --el-button-bg-color: #dc3545;
  --el-button-hover-bg-color: #bb2d3b;
}
</style>