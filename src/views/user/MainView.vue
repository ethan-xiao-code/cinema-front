<template>
  <div id="main">
    <el-container>
      <el-header class="navBar">
        <div class="head">
          <div class="title">
            <img :src="url" width="40px" alt="">
            <!-- <el-avatar
              shape="square"
              :size="50"
              fit="fill"
              :src="url"
            ></el-avatar> -->
            <span> 影院购票界面</span>
          </div>
          <el-menu
            :default-active="indexPath"
            class="el-menu-demo"
            mode="horizontal"
            router
          >
            <el-menu-item
              v-for="(item, index) in menuList"
              :index="item.path"
              :class="{ active: activeIndex === index }"
              :key="item.name"
              @click="activeIndex = index"
            >
              {{ item.name }}
            </el-menu-item>
          </el-menu>
          <el-input
            v-model="title"
            placeholder="请输入要查询的电影名"
            class="search"
          ></el-input>
          <el-button type="success" @click="goAdminPage">去后台</el-button>

          <div class="right">
            <template v-if="user.username">
              <el-avatar
                v-if="user && user.avatar"
                :src="user.avatar"
              ></el-avatar>
              <el-avatar :src="userDefault" v-else></el-avatar>
            </template>

            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                {{ user.username || "未登录" }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu v-if="user.username">
                  <el-dropdown-item
                    command="/user/me/cart"
                    :icon="ShoppingCart"
                  >
                    我的购物车
                  </el-dropdown-item>
                  <el-dropdown-item command="/user/me/order" :icon="Document">
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="/user/me/detail" :icon="User">
                    个人详情
                  </el-dropdown-item>
                  <el-dropdown-item command="switchAccount" :icon="Switch">
                    切换账号
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" :icon="Help">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
                <el-dropdown-menu v-else>
                  <el-dropdown-item command="login" :icon="SwitchButton">
                    登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <div class="emptyBox"></div>
      <el-main class="mainContent">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { recharge as rechargeApi } from "@/api/user";
import logo from "@/assets/images/logo.png";
import { ElMessage } from "element-plus";
import userDefault from "@/assets/images/user-default.png";
import {
  ShoppingCart,
  Document,
  User,
  Help,
  ArrowDown,
  SwitchButton,
  Switch,
} from "@element-plus/icons-vue";
import { userSystemTitle } from "@/utils/constant";
// 路由和状态管理
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const url = logo;
const menuList = ref([
  { name: "首页", path: "/user/home" },
  { name: "电影大全", path: "/user/movies" },
]);
const activeIndex = ref(0);
const title = ref("");
const indexPath = ref("");
// const user = ref<any>({
//   username: "",
//   avatar: "",
//   discount: "",
// });

// 生命周期钩子
onMounted(() => {
  document.title = userSystemTitle;
  indexPath.value = route.path;
  // user.value = userStore.userInfo;
  // console.log(userStore.userInfo, "userStore.userInfo;");
});
const user = computed(() => userStore.userInfo);
// 监听
watch(
  () => route.path,
  (path) => {
    indexPath.value = path;
    // document.documentElement.scrollTop = 0
  },
  { immediate: true },
);

watch(title, () => {
  toShowMovies();
});

// 方法
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
    // 用户退出登录
    toLogout();
    return;
  }

  if (command !== indexPath.value) {
    // 只有原路径和目标路径不同才可以跳转
    router.push(command);
  }
};

const toSwitchAccount = async () => {
  await userStore.logoutAction(userStore.userInfo);
  toLogin()
};

const toLogin = () => {
  router.push({
    path: "/login",
    query: {
      redirect: route.fullPath, // 当前页面的完整路径
    },
  });
};

const toLogout = async () => {
  await userStore.logoutAction(userStore.userInfo);
  // 清空本地存储的数据
  ElMessage.success("退出成功");
  router.push("/user/home");
};

const toShowMovies = () => {
  if (indexPath.value !== "/user/movies") {
    router.push({
      name: "movies",
    });
  }
};
const goAdminPage = () => {
  // router.push("/admin");
  // 新建标签页跳转方法

  const routeUrl = router.resolve({
    path: "/admin", // 目标路由路径（如：/user/detail）
    // query: { id: 123, name: "test" }, // 拼接在 URL 上的参数（可选）
  });

  // 2. 新建标签页打开解析后的 URL
  window.open(routeUrl.href, "_blank");
};
</script>

<style scoped lang="scss">
$height: 80px;

#main {
  width: 100vw;
  min-height: 100vh;
  font-size: 14px;
  position: relative;

  .navBar {
    width: 100%;
    height: $height !important;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    background-color: #fff;
    border-bottom: 1px solid pink;
    .head {
      width: 1200px;
      height: $height;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .title {
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 20px;
        font-weight: 600;
      }

      .el-menu-demo {
        display: flex;
        justify-content: flex-end;
        flex: 1;
        height: 100%;
        border: 0;
        background: transparent;

        & > li {
          height: 100%;
          display: flex;
          align-items: center;
          font-size: 16px;
          color: black;
          border: 0;
        }

        .active {
          background-color: skyblue;
          color: white;
        }
      }

      .search {
        width: 250px;
      }

      .right {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }

  .emptyBox {
    height: $height + 20px;
  }
  .mainContent {
    background-color: #fff;
    color: #333;
    text-align: center;
    padding: 0;
    /* 去除滚轮条 */
    overflow: visible;
  }
}
</style>
