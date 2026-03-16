<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="logo">
        <img :src="logoUrl" width="50" alt="">
      </div>
      <h2 class="title">汪汪影院登录界面</h2>

      <div class="tabList">
        <div
          v-for="(name, index) in tabList"
          :key="name"
          class="item"
          :class="{ active: activeIndex === index }"
          @click="activeIndex = index"
        >
          {{ name }}
        </div>
      </div>

      <LoginForm v-if="activeIndex === 0" />
      <RegisterForm v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "./components/LoginForm.vue";
import RegisterForm from "./components/RegisterForm.vue";
import logoUrl from '@/assets/images/logo.png';

const tabList = ["登录", "注册"];
const activeIndex = ref(0);
</script>

<style scoped lang="scss">
.login-wrapper {
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  /* 背景渐变 */
  background: linear-gradient(135deg, #141e30, #243b55);
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 40px 36px;

  border-radius: 18px;

  /* 玻璃拟态 */
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);

  box-shadow:
    0 10px 30px rgba(0,0,0,0.25),
    0 4px 10px rgba(0,0,0,0.08);

  text-align: center;
}

/* logo区域 */
.logo {
  margin-bottom: 10px;

  img {
    width: 54px;
    height: 54px;
  }
}

/* 标题 */
.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 28px;
  letter-spacing: 1px;
}

/* tab */
.tabList {
  display: flex;

  height: 44px;
  margin-bottom: 28px;

  background: #f3f4f6;
  border-radius: 22px;

  padding: 4px;
}

.item {
  flex: 1;
  display: grid;
  place-items: center;

  font-size: 15px;
  cursor: pointer;

  border-radius: 18px;

  transition: all 0.25s;
}

/* 默认状态 */
.item:hover {
  color: #409eff;
}

/* 激活状态 */
.active {
  background: #fff;
  color: #409eff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
</style>
