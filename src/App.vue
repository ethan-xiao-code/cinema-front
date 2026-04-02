<template>
  <el-config-provider :locale="zhCn">
    <router-view />
    <Login />
  </el-config-provider>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 手动引入中文语言包
const Login = defineAsyncComponent(() => import('@/components/Login/index.vue')) // 异步引入组件

</script>

<style lang="scss">
@use '@/assets/styles/baseCommon.scss';
</style>
