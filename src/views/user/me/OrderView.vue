<template>
  <div id="order">
    <div class="order-container">
      <h2 class="page-title">我的订单</h2>
      <p class="order-tip">
        温馨提示：开场前 30 分钟内的订单不可取消
      </p>
      <!-- 订单列表 -->
      <div v-if="ordersList.length > 0" class="order-list">
        <div class="order-item" v-for="order in ordersList" :key="order.id">
          <!-- 订单海报 -->
          <div class="order-poster">
            <img :src="order.poster" alt="电影海报" class="poster-img" loading="lazy">
          </div>

          <!-- 订单主要信息 -->
          <div class="order-main">
            <h3 class="film-name">{{ order.filmName }}</h3>
            <div class="info-box">
              <span class="info-item">放映厅：{{ order.screenRoomName }}</span>
              <span class="info-item">座位：{{ order.seatNumberStr }} 号</span>
              <div>
                <span class="info-item">开场时间：</span>
                <span class="info-item highlight">{{ order.startTime }}</span>
              </div>
              <span class="info-item">时长：{{ order.filmDuration }} 分钟</span>
              <div>
                <span class="info-item">支付时间：</span>
                <span class="info-item">{{ order.payTime }}</span>
              </div>
            </div>

          </div>

          <!-- 订单操作区域 -->
          <div class="order-actions">
            <div class="order-amount">¥{{ order.amount.toFixed(2) }}</div>
            <el-tag :type="getTypeByValue(payStatusOptions, order.status)" class="status-tag">
              {{ getLabelByValue(payStatusOptions, order.status) }}
            </el-tag>
            <el-button :disabled="order.status !== 1 || isOrderExpired(order.startTime)" type="danger" 
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
import { getOrdersList, cancelOrdersApi } from "@/api/orders";
import { getLabelByValue, getTypeByValue, payStatusOptions } from '@/utils/constant';

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
  filmDuration: number;
}


const ordersList = ref<OrderItem[]>([])

onMounted(async () => {
  await getOrdersByUserId()
})

/** 获取用户订单列表 */
const getOrdersByUserId = async () => {
  try {
    const res = await getOrdersList()
    ordersList.value = res || []
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

  await ElMessageBox.confirm(
    "此操作将取消该订单, 是否继续?",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )

  await cancelOrdersApi(order.id)
  await getOrdersByUserId() // 刷新订单列表
  ElMessage.success("取消成功")

}
</script>

<style lang="scss" scoped>
#order {
  .order-container {
    background-color: #FFF;

    // 页面标题
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #212529;
      padding-bottom: 12px;

    }

    .order-tip {
      margin-bottom: 20px;
      font-size: 14px;
      color: #e74c3c;
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
      padding: 20px;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      // 订单海报
      .order-poster {
        height: 100%;
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
        }

        .info-box {
          display: grid;
          grid-template-columns: 2fr 1fr;
          margin-top: 6px;

          .info-item {
            font-size: 14px;
            color: #495057;
            // margin-right: 24px;
            line-height: 25px;

            &.highlight {
              color: #e74c3c;
              font-weight: 500;
            }
          }

        }


      }

      // 订单操作区域
      .order-actions {
        width: 300px;
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