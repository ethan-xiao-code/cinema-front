```vue
<template>
  <div class="backBox">
    <div class="content">
      <h1 class="code">404</h1>

      <p class="title">页面不存在或权限不足</p>

      <p class="desc">
        抱歉，你访问的页面可能不存在，或者当前账号没有访问权限。
        <br />
        请返回首页继续浏览。
      </p>

      <el-button type="primary" size="large" @click="toHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    toHome() {
      this.$router.push('/user')
    }
  }
}
</script>

<style scoped>
.backBox {
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

/* 内容卡片 */
.content {
  text-align: center;
  padding: 40px 60px;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* 404数字 */
.code {
  font-size: 80px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

/* 标题 */
.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
}

/* 描述 */
.desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}
</style>
```
