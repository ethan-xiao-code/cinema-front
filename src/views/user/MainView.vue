<template>
  <div id="main">
    <div class="navBar">
      <div class="navContainer">
        <!-- 左：Logo -->
        <div class="logoBox">
          <img :src="url" />
          <span>汪汪影院</span>
        </div>

        <!-- 右：菜单 + 搜索 + 用户 -->
        <div class="rightWrap">
          <!-- 中间菜单 -->
          <div class="menuBox">
            <div v-for="item in menuList" :key="item.path" class="menuItem"
              :class="{ active: route.path === item.path }" @click="router.push(item.path)">
              {{ item.name }}
            </div>
          </div>
          <div class="searchBox">
            <!-- 搜索 -->
            <el-input v-model="filmTitle" placeholder="搜索电影" class="searchInput" />
            <el-button class="searchBtn" type="primary" @click="handleFilmQuery">查询</el-button>
          </div>


          <el-button type="success" @click="goAdminPage">后台管理</el-button>

          <!-- 用户 -->
          <el-dropdown @command="handleCommand">
            <div class="userBox">
              <img :src="user?.avatar || userDefault" />
              <div>
                <span class="username">
                  {{ user?.username || '未登录' }}
                </span>
                <el-icon class="el-icon--right">
                  <ArrowDownBold />
                </el-icon>
              </div>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <!-- 已登录 -->
                <template v-if="user?.username">
                  <el-dropdown-item command="/user/me/cart">
                    <el-icon>
                      <shopping-cart-full />
                    </el-icon>
                    <span>我的购物车</span>
                  </el-dropdown-item>

                  <el-dropdown-item command="/user/me/order">
                    <el-icon>
                      <Document />
                    </el-icon>
                    <span>我的订单</span>
                  </el-dropdown-item>

                  <el-dropdown-item command="/user/me/detail">
                    <el-icon>
                      <User />
                    </el-icon>
                    <span>我的信息</span>
                  </el-dropdown-item>

                  <el-dropdown-item command="switchAccount">
                    <el-icon>
                      <switch-button />
                    </el-icon>
                    <span>切换账号</span>
                  </el-dropdown-item>

                  <el-dropdown-item command="logout">
                    <el-icon>
                      <remove />
                    </el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </template>

                <!-- 未登录 -->
                <template v-else>
                  <el-dropdown-item command="login">
                    <el-icon>
                      <Help />
                    </el-icon>
                    <span>登录</span>
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
      </div>
    </div>

    <div class="navPlaceholder"></div>
    <div class="mainContent">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import logo from "@/assets/images/logo.png";
import { ElMessage } from "element-plus";
import userDefault from "@/assets/images/user-default.png";

import {
  ShoppingCart,
  Document,
  Help,
  SwitchButton,
  ArrowDownBold,
  ShoppingCartFull,
  CloseBold,
  Aim,
  User,
  Remove,
} from "@element-plus/icons-vue";
import { userSystemTitle } from "@/utils/constant";

// 路由和状态管理（原有逻辑不变）
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const url = logo;
const menuList = ref([
  { name: "首页", path: "/user/home" },
  { name: "电影大全", path: "/user/movies" },
]);
const filmTitle = ref("");

// 生命周期钩子
onMounted(() => {
  document.title = userSystemTitle;
});
const user = computed(() => userStore.userInfo);

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    document.documentElement.scrollTop = 0;
  },
  { immediate: true },
);
const handleFilmQuery = () => {
  toShowMovies(filmTitle.value)
}


// 下拉菜单处理
const handleCommand = (command: string) => {
  if ("switchAccount" === command) {
    toSwitchAccount();
    return;
  }
  if (command === "login") {
    toLogin();
    return;
  }
  if (command === "logout") {
    toLogout();
    return;
  }
  if (command !== route.path) {
    router.push(command);
  }
};

// 切换账号
const toSwitchAccount = async () => {
  await userStore.logoutAction(userStore.userInfo);
  toLogin();
};

// 登录跳转
const toLogin = () => {
  router.push({
    path: "/login",
    query: { redirect: route.fullPath },
  });
};

// 退出登录
const toLogout = async () => {
  await userStore.logoutAction(userStore.userInfo);
  ElMessage.success("退出成功");
  router.push("/user/home");
};

// 搜索跳转电影页
const toShowMovies = (filmTitle: string) => {
  router.push({
    name: "movies",
    query: {
      filmTitle
    }
  });
};

// 打开后台页面
const goAdminPage = () => {
  // const routeUrl = router.resolve({ path: "/admin" });
  // window.open(routeUrl.href, "_blank");
  if (userStore.userId && userStore.userInfo?.roleId === 1) {
    router.push("/admin")
  } else {
    ElMessage.warning("只有管理员才可以进入哦~")
  }
};
</script>

<style scoped lang="scss">
#main {
  min-height: 100vh;
  background: #f6f7fb;

  .navBar {
    position: fixed;
    top: 0;
    width: 100%;
    min-width: 1000px;
    height: 72px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    z-index: 1000;

    .navContainer {
      height: 100%;
      margin: auto;
      padding: 0 24px;
      display: flex;
      align-items: center;

      /* 左 */
      .logoBox {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;

        img {
          width: 40px;
          height: 40px;
        }

        span {
          font-size: 20px;
          font-weight: 600;
        }
      }

      /* 右整体 */
      .rightWrap {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 24px;

        /* 菜单 */
        .menuBox {
          display: flex;
          gap: 12px;

          .menuItem {
            padding: 8px 18px;
            border-radius: 999px;
            font-size: 15px;
            cursor: pointer;
            color: #555;
            transition: all 0.25s;

            &:hover {
              background: #eef2ff;
              color: #4f46e5;
            }

            &.active {
              background: #4f46e5;
              color: #fff;
              font-weight: 500;
            }
          }
        }

        .searchBox {
          .searchInput {
            width: 220px;
            margin-right: 10px;
          }
        }


        /* 用户 */
        .userBox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          &>img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .username {
            max-width: 80px;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .navPlaceholder {
    height: 72px;
  }

  .mainContent {
    padding: 24px;
  }
}
</style>
