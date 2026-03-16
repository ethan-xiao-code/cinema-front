<template>
  <div id="cinema-page">
    <router-view />
    <Login />
  </div>
</template>

<script setup lang="ts">
import Login from "@/components/Login/index.vue";

</script>

<style lang="scss">
@use '@/assets/styles/baseCommon.scss';
// #cinema-page {
//   min-width: 1000px;

// }</style>
