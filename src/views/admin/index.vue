<template>
  <div class="app-container">
    <!-- 主布局容器（Flex 容器） -->
    <div class="main-layout">
      <!-- 侧边栏（Flex 项目） -->
      <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapse }">
        <!-- 折叠按钮 -->
        <div class="collapse-trigger" @click="toggleCollapse">
          <el-icon>
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <!-- 侧边栏菜单 -->
        <el-menu
          :default-active="currentPath"
          class="sidebar-menu"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true"
          :collapse="isCollapse"
        >
          <SideBarItem
            v-for="route in routes"
            :key="route.path"
            :route="route"
          />
        </el-menu>
      </aside>

      <!-- 主内容区（Flex 项目，占剩余空间） -->
      <div class="main-content">
        <!-- 头部导航 -->
        <header class="header">
          <div class="header-inner">
            <!-- 系统信息 -->
            <div class="system-info">
              <el-avatar shape="square" :size="40" fit="fill" :src="logoUrl" />
              <span class="system-name">汪汪影院</span>
            </div>

            <!-- 当前页面标题 -->
            <div class="page-title">{{ metaName }}</div>

            <el-button type="primary" @click="toHomePage">去首页</el-button>
          </div>
        </header>

        <!-- 页面内容区 -->
        <main class="page-content">
          <router-view />
        </main>
      </div>
    </div>

    <!-- 个人中心弹窗 -->
    <MyCenterDialog v-model="showCenterDialog" />

    <!-- 修改密码弹窗
    <ChangePasswordDialog v-model="showPasswordDialog" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Fold,
  Expand,
  ArrowDown,
  User,
  Setting,
  Key,
  SwitchButton,
} from "@element-plus/icons-vue";
import MyCenterDialog from "./components/MyCenterDialog.vue";
// import ChangePasswordDialog from "./components/ChangePasswordDialog.vue";
import SideBarItem from "./components/SideBarItem.vue";
import { useUserStore } from "@/stores";
import { adminSystemTitle } from "@/utils/constant";

// 组合式 API
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const currentPath = ref<string>(route.path);
const showCenterDialog = ref<boolean>(false);
const showPasswordDialog = ref<boolean>(false);
const isCollapse = ref<boolean>(false);

// 计算属性：过滤掉 hidden 路由
const routes = computed(() => {
  return router.options.routes.filter((r: any) => !r.hidden);
});

// 计算属性：当前页面标题（支持嵌套路由）
const metaName = computed(() => {
  const findRoute = (routesList: any[]): any => {
    for (const r of routesList) {
      if (r.path === currentPath.value) return r.meta;
      if (r.children) {
        const child = findRoute(r.children);
        if (child) return child;
      }
    }
    return null;
  };
  const meta = findRoute(routes.value);
  return meta?.title || "";
});

// 计算属性：用户信息
const username = computed((): string => {
  return userStore.userInfo?.username || "管理员";
});


const userAvatar = computed((): string => {
  return (
    userStore.userInfo?.avatar ||
    new URL("@/assets/images/user-default.png", import.meta.url).href
  );
});

const logoUrl = ref<string>(
  new URL("@/assets/images/logo.png", import.meta.url).href,
);
// 监听器
watch(
  () => route.path,
  (newPath: string) => {
    currentPath.value = newPath;
  },
);

// 生命周期
onMounted(() => {
  document.title = adminSystemTitle;
});

// 方法
const toggleCollapse = (): void => {
  isCollapse.value = !isCollapse.value;
};

const logout = async (): Promise<void> => {
  await userStore.logoutAction(userStore.userInfo);
  ElMessage.success("退出成功");
  router.push("/user");
};

const toHomePage = () => {
  router.push("/user");

}

const handleCommand = async (command: string): Promise<void> => {
  switch (command) {
    case "out":
      await logout();
      break;

    case "home_page":
      router.push("/user")
      break;

    case "settings":
      // 跳转到设置页面
      router.push("/admin/settings");
      break;

    case "change_password":
      showPasswordDialog.value = true;
      break;
  }
};
</script>

<style scoped lang="scss">
// 变量定义
$sidebar-width: 240px;
$sidebar-collapsed-width: 64px;
$header-height: 70px;
$bg-color: #f5f7fa;
$sidebar-bg: #545c64;
$primary-color: #409eff;

// 根容器
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: $bg-color;
}

// 主布局（Flex 容器：横向排列）
.main-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

// 侧边栏（固定宽度）
.sidebar {
  width: $sidebar-width;
  height: 100%;
  background: linear-gradient(
    180deg,
    $sidebar-bg 0%,
    darken($sidebar-bg, 5%) 100%
  );
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  // 折叠状态
  &.sidebar-collapsed {
    width: $sidebar-collapsed-width;
  }

  // 折叠触发器
  .collapse-trigger {
    position: absolute;
    top: 20px;
    right: -15px;
    width: 30px;
    height: 30px;
    background: $primary-color;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
    transition: all 0.3s;
    z-index: 1;

    &:hover {
      background: lighten($primary-color, 10%);
      transform: scale(1.1);
    }

    .el-icon {
      font-size: 16px;
    }
  }

  // 侧边栏菜单
  .sidebar-menu {
    width: 100%;
    height: 100%;
    padding-top: 60px; // 给折叠按钮留空间
    border: none;

    // &:not(.el-menu--collapse) {
    //   width: $sidebar-width;
    // }
  }
}

// 主内容区（占满剩余空间）
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0; // 防止内容溢出
}

// 头部区域
.header {
  height: $header-height;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 30px;
  }

  // 系统信息
  .system-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .system-name {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
    }
  }

  // 页面标题
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  
  }

  // 用户操作区
  .user-actions {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      cursor: pointer;

      .user-avatar {
        border: 2px solid #e6e6e6;
      }

      .user-details {
        display: flex;
        flex-direction: column;

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          transition: color 0.3s;
        }

        .user-role {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }

      .dropdown-arrow {
        color: #c0c4cc;
        transition: transform 0.3s;
        margin-left: 4px;
      }
    }
  }
}

// 页面内容区
.page-content {
  flex: 1;
  background: $bg-color;
  padding: 24px;
  overflow-y: auto;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

// 适配PC端的响应式（最小宽度限制）
@media (max-width: 1200px) {
  .sidebar {
    width: 200px;

    &.sidebar-collapsed {
      width: 64px;
    }
  }

  .page-title {
    font-size: 16px !important;
  }
}

@media (max-width: 992px) {
  .app-container {
    min-width: 992px; // 设置最小宽度，确保在较小屏幕上也能正常显示
  }

  .header .header-inner {
    padding: 0 20px;
  }

  .page-content {
    padding: 20px;
  }
}

// 动画效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
