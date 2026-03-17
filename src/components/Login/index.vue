<template>
  <div>

    <!-- 弹框 -->
    <el-dialog :title="activeIndex === 0 ? '登录' : '注册'" width="500px" v-model="showDialog" :close-on-click-modal="false"
      :destroy-on-close="true" center>
      <!-- Tab切换 -->
      <div class="tabList">
        <div v-for="(name, index) in tabList" :key="name" class="item" :class="{ active: activeIndex === index }"
          @click="activeIndex = index">
          {{ name }}
        </div>
      </div>

      <!-- 登录/注册表单 -->
      <LoginForm v-if="activeIndex === 0" @onCancel="onCancel" @onSuccess="onSuccess" />
      <RegisterForm v-else @onCancel="onCancel" @onSuccess="onSuccess" />

    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";
import { eventBus } from "@/utils/eventBus";
import router from "@/router";
import { useRoute } from "vue-router";
const route = useRoute()

const showDialog = ref(false);
const tabList = ["登录", "注册"];
const activeIndex = ref(0);
let redirectPath: string = '';
// 登录或注册成功回调
const onSuccess = () => {
  showDialog.value = false; // 成功后关闭弹框
  if (redirectPath) {
    router.replace(redirectPath)
  }
};

const onCancel = () => {
  showDialog.value = false; // 成功后关闭弹框
}
const openDialog = () => {
  showDialog.value = true
}
onMounted(() => {
  eventBus.on('showLoginDialog', (payload) => {
    redirectPath = payload?.redirectPath || route.path
    openDialog()
  });
});

onUnmounted(() => {
  eventBus.off('showLoginDialog', openDialog);
});
</script>

<style scoped lang="scss">
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

.item:hover {
  color: #409eff;
}

.active {
  background: #fff;
  color: #409eff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.dialog-footer {
  display: flex;
}
</style>