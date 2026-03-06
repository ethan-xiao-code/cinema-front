<template>
  <div id="cart">
    <div class="cart-container">
      <h2 class="cart-title">购物车</h2>

      <!-- 购物车列表 -->
      <div v-if="cartList.length !== 0" class="cart-list">
        <el-checkbox-group v-model="checkedCartList" @change="handleCheckedCitiesChange">
          <div class="cart-item" v-for="cart in cartList" :key="cart.id">
            <!-- 复选框 -->
            <div class="checkbox-col">
              <el-checkbox :label="cart" :key="cart.id" size="large">
                <br />
              </el-checkbox>
            </div>

            <!-- 海报图片 -->
            <div class="poster-col">
              <img :src="cart.poster" class="film-poster" alt="电影海报" loading="lazy" />
            </div>

            <!-- 主要信息 -->
            <div class="info-col">
              <p class="film-title">{{ cart.filmName }}</p>

              <div class="info-box">
                <div class="info-item">放映厅：{{ cart.screenName }}</div>
                <div class="info-item">座位：{{ cart.seatNumbers }}号</div>

                <div>
                  <span class="info-item">开场时间：</span>
                  <span class="info-item highlight">{{ cart.startTime }}</span>
                </div>
                <div class="info-item">播放时长：{{ cart.filmDuration }} 分钟</div>
                <div class="info-item">创建时间：{{ cart.createTime }}</div>
              </div>

            </div>

            <!-- 价格和删除按钮 -->
            <div class="action-col">
              <span class="price">￥ {{ cart.price.toFixed(2) }}</span>
              <el-button type="danger" :icon="Delete" @click="batchDeleteCart([cart.id])" link size="small"
                class="delete-btn"></el-button>
            </div>
          </div>
        </el-checkbox-group>

        <!-- 结算栏 -->
        <div class="checkout-bar">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange"
            class="check-all" size="large">全选</el-checkbox>

          <el-button :disabled="checkedCartList.length === 0" class="batch-delete" type="danger"
            @click="batchDeleteCart(checkedCartList.map(item => item.id))">批量删除购物车</el-button>

          <div class="price-info">
            <span class="total-price">总价：
              <span class="price-value">￥{{ totalPrice }}</span>
            </span>
          </div>

          <el-button type="success" class="checkout-btn" @click="openCheckoutModal" size="large">
            结算
          </el-button>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <el-empty :image-size="200" description="这里空空如也，快去选购心仪的电影票吧～"></el-empty>
        <el-button type="primary" class="go-shopping-btn" @click="$router.push('/user/home')">
          去购票
        </el-button>
      </div>
    </div>

    <!-- 结算确认 Modal -->
    <el-dialog v-model="payModalVisible" title="订单确认" :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="checkout-modal-content">
        <div class="modal-info">
          <p class="info-title">请确认以下订单信息：</p>
          <!-- 选中的商品列表 -->
          <div class="selected-items">
            <div class="item-row" v-for="item in checkedCartList" :key="item.id">
              <span class="item-name">{{ item.filmName }}</span>
              <span class="item-detail">
                {{ item.screenName }} | {{ item.seatNumbers }}号 |
                {{ item.startTime }}
              </span>
              <span class="item-price">￥{{ item.price }}</span>
            </div>
          </div>
          <!-- 价格汇总 -->
          <div class="price-summary">
            <div class="summary-row">
              <span class="label">订单总价：</span>
              <span class="value">￥{{ totalPrice }}</span>
            </div>

            <div class="summary-row total-row">
              <span class="label">实付金额：</span>
              <span class="value highlight">￥{{ totalPrice }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payModalVisible = false">取消支付</el-button>
          <el-button :loading="loading" type="primary" @click="confirmPay">确认支付</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores";
import { getCartes, deleteCartByIdApi } from "@/api/cart";
import { saveOrdersApi } from "@/api/orders";
import { Delete } from "@element-plus/icons-vue";
import { useRequest } from "@/utils/useRequest";

// ========== 类型定义 ==========
interface CartItem {
  id: number;
  filmName: string;
  poster: string;
  screenName: string;
  seatNumbers: string;
  phone: string;
  startTime: string;
  price: number;
  scheduleId: number;
  expireTime: string;
  createTime: string;
  filmDuration: number;
}

interface OrderItem {
  cartId: number;
  filmName: string;
  poster: string;
  scheduleId: number;
  seatNumbers: string;
  amount: string;
  startTime: string;
}

// ========== 响应式变量 ==========
const checkAll = ref(false);
const checkedCartList = ref<CartItem[]>([]);
const isIndeterminate = ref(false);
const cartList = ref<CartItem[]>([]);
const oldCartCount = ref<number>(-1)
// 新增：结算Modal的显示状态
const payModalVisible = ref(false);

const timer = ref<any>(null);

// 获取用户仓库
const userStore = useUserStore();

const totalPrice = computed(() =>
  checkedCartList.value.reduce((sum, item) => {
    const priceStr = (sum + item.price).toFixed(2);
    return Number(priceStr);
  }, 0),
);

/** 获取用户购物车列表 */
const getCartesByUserId = async () => {
  const res = await getCartes();
  cartList.value = res || [];
  return res || [];
};

const { startPolling, stopPolling } = useRequest(getCartesByUserId, {
  intervalTime: 1000 * 30,
  onSuccess: (data) => {
    if (oldCartCount.value === 0) {
      stopPolling()
      return;
    }

    //  记录刷新后的购物车商品数量
    const newCount = data.length;

    //  对比数量：新数量 < 旧数量 → 说明有座位过期被移除
    if (newCount < oldCartCount.value) {
      // 提示用户座位过期
      ElMessage.warning("部分座位已过期，已自动移除");
      // 关闭支付弹窗（如果打开）
      payModalVisible.value = false;
      // 清空选中的商品列表
      checkedCartList.value = [];
      // 取消全选状态
      checkAll.value = false;
    }

    oldCartCount.value = newCount
  }
})
// ========== 生命周期 ==========
onMounted(() => {
  // await getCartesByUserId();
  // startInteval();
  startPolling()
  // 获取用户折扣
  // discount.value = userStore.userInfo?.discount || 1;
});

onUnmounted(() => {
  // stopInteval();
  stopPolling()
});


const startInteval = () => {
  // 防重复启动：如果定时器已存在（timer.value有值），则直接返回
  // 边界判断：如果购物车本身无数据，无需启动定时器，直接返回
  if (timer.value || cartList.value.length === 0) return;

  // 启动定时器，每隔60秒执行一次购物车检查逻辑
  // 注：60 * 1000 = 60秒，避免短时间频繁请求接口
  timer.value = setInterval(async () => {
    try {
      // 1. 记录刷新前的购物车商品数量（用于后续对比）
      const oldCount = cartList.value.length;

      // 2. 若当前购物车已无数据，停止定时器并终止本次执行
      if (oldCount === 0) {
        stopInteval();
        return;
      }

      // 3. 调用接口重新获取最新的购物车数据（检查座位是否过期）
      await getCartesByUserId();

      // 4. 记录刷新后的购物车商品数量
      const newCount = cartList.value.length;

      // 5. 对比数量：新数量 < 旧数量 → 说明有座位过期被移除
      if (newCount < oldCount) {
        // 提示用户座位过期
        ElMessage.warning("部分座位已过期，已自动移除");
        // 关闭支付弹窗（如果打开）
        payModalVisible.value = false;
        // 清空选中的商品列表
        checkedCartList.value = [];
        // 取消全选状态
        checkAll.value = false;
      }

    } catch (error) {
      // 异常处理：接口请求失败时打印错误，避免定时器因报错终止
      console.error("购物车定时刷新失败：", error);
      // 可选：失败后停止定时器，防止无限报错
      // stopInteval();
    }
  }, 60 * 1000); // 定时器间隔：60秒（1分钟）
};
const stopInteval = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

// ========== 方法定义 ==========

/** 全选/取消全选 */
const handleCheckAllChange = (val: boolean) => {
  checkedCartList.value = val ? [...cartList.value] : [];
  isIndeterminate.value = false;
};

/** 单个复选框变更 */
const handleCheckedCitiesChange = (value: CartItem[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === cartList.value.length;
  isIndeterminate.value =
    checkedCount > 0 && checkedCount < cartList.value.length;
};

/** 删除购物车项 */
const batchDeleteCart = async (ids: number[]) => {
  await deleteCartByIdApi(ids);
  ElMessage.success("删除购物车成功");
  await getCartesByUserId(); // 重新获取购物车列表
  checkedCartList.value = []
};

/** 打开结算确认Modal */
const openCheckoutModal = () => {
  if (totalPrice.value === 0) {
    ElMessage.error("结算的金额不能是0");
    return;
  }
  // 打开Modal
  payModalVisible.value = true;
};

/** 保存订单 */
const addOrders = async () => {
  await saveOrdersApi(ordersParams.value);
  ElMessage.success("支付成功");
  await getCartesByUserId(); // 重新获取购物车列表
  // 清空选中状态
  checkAll.value = false;
  checkedCartList.value = [];
};

const { runFn: confirmPay, loading } = useRequest(addOrders, {
  onSuccess: () => {
    payModalVisible.value = false;
  }
})

// /** 确认支付 */
// const confirmPay = async () => {
//   await addOrders();
//   // 关闭Modal
//   payModalVisible.value = false;
// };



/** 转换购物车数据为订单数据 */
const ordersParams = computed<OrderItem[]>(() => {
  return checkedCartList.value.map((item) => {
    return {
      ...item,
      cartId: item.id,
      amount: item.price.toFixed(2)
    }
  });
});
</script>

<style lang="scss" scoped>
// 全局基础样式
#cart {
  text-align: left;

  .cart-container {
    margin: 0 auto;

    .cart-title {
      font-size: 24px;
      font-weight: 700;
      color: #212529;
      position: relative;
      padding-bottom: 24px;
    }

    // 购物车列表
    .cart-list {

      // 购物车项
      .cart-item {
        width: 100%;
        height: 140px;
        background-color: #fff;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: flex-start; // 明确主轴对齐方式
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);

          .film-poster {
            transform: scale(1.02);
          }
        }

        // 复选框列 - Flex 优化
        .checkbox-col {
          text-align: center;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; // 最小宽度，防止过窄
        }

        // 海报列 - Flex 优化
        .poster-col {
          height: 100%;
          margin-right: 24px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

          .film-poster {
            height: 100%;
            width: auto;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
        }

        // 信息列 - Flex 核心优化
        .info-col {
          flex: 1 1 auto; // 自动填充剩余空间，允许缩放
          height: 100%;
          margin: 0 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start; // 交叉轴左对齐
          min-width: 280px; // 最小宽度，防止挤压变形

          .film-title {
            font-weight: 600;
            font-size: 18px;
            color: #212529;
          }

          .info-box {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 20px;
            margin-top: 16px;

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

        // 操作列 - Flex 优化
        .action-col {
          flex: 0 0 220px; // 固定宽度，不缩放
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end; // 内容右对齐
          gap: 20px;
          padding-right: 8px;
          min-width: 200px; // 最小宽度保障

          .price {
            flex: 0 0 120px; // 固定宽度
            font-size: 18px;
            color: #e74c3c;
            font-weight: 700;
            display: inline-block;
            text-align: right;
          }

          .delete-btn {
            font-size: 20px;
          }
        }
      }

      // 结算栏
      .checkout-bar {
        width: 100%;
        height: 90px;
        background-color: #f8f9fa; // 浅灰白底色（替代原深灰）
        border: 1px solid #e9ecef; // 增加边框，提升质感
        border-radius: 12px;
        margin-top: 24px;
        display: flex;
        align-items: center;
        padding: 0 30px;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); // 更柔和的阴影

        .check-all {
          color: #212529; // 深灰文字（替代原白色）
          font-size: 16px;
          font-weight: 500;
        }

        .batch-delete {
          margin-left: 40px;
        }

        .tip {
          color: grey;
          font-size: 14px;
          margin-left: 32px;
        }

        .price-info {
          margin-left: auto;
          display: flex;
          gap: 40px;
          color: #495057; // 中灰文字（替代原浅灰）
          font-size: 16px;

          .total-price,
          .discount-price {
            .price-value {
              font-size: 22px;
              font-weight: 700;
              width: 120px;
              display: inline-block;
              text-align: right;
              color: red; // 深灰价格（替代原白色）

              &.highlight-price {
                color: #409eff; // 蓝色突出优惠价（替代原金色）
              }
            }
          }
        }

        .checkout-btn {
          margin-left: 30px;
          padding: 12px 36px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          background-color: #409eff; // 蓝色按钮（替代原绿色）
          border: none;
          transition:
            background-color 0.2s ease,
            transform 0.1s ease;

          &:hover {
            background-color: #3393ff; // 加深蓝色hover
            transform: scale(1.02);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }

    // 空购物车
    .empty-cart {
      text-align: center;
      padding: 80px 0;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      margin-top: 20px;

      .go-shopping-btn {
        margin-top: 30px;
        padding: 12px 40px;
        font-size: 16px;
        border-radius: 8px;
        background-color: #409eff;
        border: none;

        &:hover {
          background-color: #3393ff;
        }
      }
    }
  }
}

// 结算Modal样式
.checkout-modal-content {
  padding: 10px 0;

  .modal-info {
    .info-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }

    .selected-items {
      margin-bottom: 20px;
      max-height: 200px;
      overflow-y: auto;

      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        .item-name {
          flex: 1;
          font-weight: 500;
          color: #333;
        }

        .item-detail {
          flex: 2;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .item-price {
          flex: 1;
          text-align: right;
          color: #e74c3c;
          font-weight: 600;
        }
      }
    }

    .price-summary {
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;

        &.total-row {
          margin-top: 10px;
          border-top: 1px solid #f0f0f0;
          padding-top: 10px;

          .label {
            font-size: 16px;
            font-weight: 600;
          }

          .value {
            font-size: 18px;
          }
        }

        .label {
          color: #666;
        }

        .value {
          color: #333;

          &.highlight {
            color: #e74c3c;
            font-weight: 700;
          }
        }
      }
    }
  }
}

// 重置默认样式
p {
  margin: 0;
  padding: 0;
}
</style>
