<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="logo">
        <img :src="logoUrl" width="50" alt="">
      </div>
      <h2 class="title">影院购票系统登录界面</h2>

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
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 420px;
  padding: 36px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.logo {
  // font-size: 42px;
  margin-bottom: 8px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}

.sub-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 24px;
}

.tabList {
  display: flex;
  height: 42px;
  background: #2b2c2e;
  border-radius: 21px;
  margin-bottom: 24px;

  .item {
    flex: 1;
    display: grid;
    place-items: center;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;
  }

  .active {
    background: linear-gradient(135deg, #5eafb5, #3c8d93);
    border-radius: 21px;
    color: #000;
    font-weight: 500;
  }
}
</style>
