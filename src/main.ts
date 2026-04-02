// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'

// ---------------- Pinia ----------------
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@/utils/rem.js'
// ---------------- Element Plus ----------------
// import ElementPlus from 'element-plus' // 全量引入，会导致打包体积过大
// import 'element-plus/dist/index.css'


// ---------------- 创建 Vue App ----------------
const app = createApp(App)

// 注册插件顺序：Pinia 插件 -> Pinia -> 其他插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
// 路由
app.use(router)

// ---------------- 挂载 ----------------
app.mount('#app')