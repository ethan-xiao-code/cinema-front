<template>
  <div id="me">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">个人中心</h2>
        </div>
        <el-menu
          :default-active="indexPath"
          class="sidebar-menu"
          router
          unique-opened
          active-text-color="#409eff"
          text-color="#333"
          background-color="#fff"
        >
          <el-menu-item index="/user/me/cart">
            <el-icon class="menu-icon"><ShoppingCart /> </el-icon>
            <template #title>购物车</template>
          </el-menu-item>
          <el-menu-item index="/user/me/order">
            <el-icon class="menu-icon"><Tickets /> </el-icon>
            <template #title>我的订单</template>
          </el-menu-item>
          <el-menu-item index="/user/me/detail">
            <el-icon class="menu-icon"><Setting /> </el-icon>
            <template #title>基本设置</template>
          </el-menu-item>
        </el-menu>
        
        <!-- 侧边栏底部占位（视觉平衡） -->
        <div class="sidebar-footer"></div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Setting, ShoppingCart, Tickets } from "@element-plus/icons-vue";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

// 获取路由实例
const route = useRoute();

// 响应式变量
const indexPath = ref("");

// 生命周期
onMounted(() => {
  indexPath.value = route.path;
});

// 监听路由变化，更新激活菜单（新增：解决路由跳转后菜单不激活问题）
watch(
  () => route.path,
  (newPath) => {
    indexPath.value = newPath;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
#me {
  width: 100%; // 改为全屏宽度，更适配不同屏幕
  max-width: 1920px; // 限制最大宽度，避免大屏拉伸
  margin: 0 auto;
  text-align: left;
  background-color: #f5f7fa; // 页面背景色，提升整体质感

  .layout-container {
    height: 100%;
    display: flex; // 确保容器布局正常
  }

  // 侧边栏样式
  .sidebar {
    width: 220px; // 加宽侧边栏，提升操作舒适度
    color: #333;
    background-color: #fff;
    position: fixed;
    z-index: 10; // 提升层级，避免被其他元素遮挡
    height: 100vh;
    box-sizing: border-box;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.05); // 轻微阴影，区分主内容区
    transition: box-shadow 0.2s ease;

    // 侧边栏hover阴影加深（可选）
    &:hover {
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
    }

    // 侧边栏头部
    .sidebar-header {
      padding: 0 20px;
      height: 80px; // 固定头部高度，视觉更规整
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f0f2f5; // 分隔线，提升层次感

      .sidebar-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #212529;
        letter-spacing: 0.5px; // 字间距，提升可读性
      }
    }

    // 侧边栏菜单
    .sidebar-menu {
      width: 100%;
      border-right: none; // 移除默认边框，避免重复
      padding: 10px 0;

      .el-menu-item {
        height: 50px; // 加高菜单项，提升点击体验
        line-height: 50px;
        margin: 4px 0; // 菜单项间距
        border-radius: 0 8px 8px 0; // 右侧圆角，更现代
        padding-left: 28px !important; // 调整内边距，对齐更美观
        transition: all 0.2s ease;

        // 菜单图标样式
        .menu-icon {
          font-size: 16px;
          margin-right: 10px;
          color: #666;
        }

        // 激活态样式
        &.is-active {
          background-color: #ecf5ff !important; // 激活背景色
          
          .menu-icon {
            color: #409eff; // 激活图标色
          }
        }

        // hover样式
        &:hover {
          background-color: #f8f9fa;
        }
      }
    }

    // 侧边栏底部占位
    .sidebar-footer {
      height: 80px;
    }
  }

  // 主内容区样式
  .main-content {
    background-color: transparent; // 透明背景，继承页面底色
    color: #333;
    margin-left: 220px; // 适配加宽后的侧边栏
    min-height: 100vh;
    box-sizing: border-box;
    padding: 30px; // 加大内边距，提升内容展示舒适度
    width: calc(100% - 220px); // 自适应宽度，避免内容溢出
  }
}

// 重置Element默认样式（优化细节）
:deep(.el-menu-vertical-demo:not(.el-menu--collapse)) {
  width: 220px;
  min-height: 400px;
}

:deep(.el-menu) {
  --el-menu-text-color: #495057;
  --el-menu-active-text-color: #409eff;
  --el-menu-hover-text-color: #212529;
}
</style>