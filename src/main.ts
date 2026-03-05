// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'

// ---------------- Pinia ----------------
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@/utils/rem.js'
// ---------------- Element Plus ----------------
import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// ---------------- 自定义组件 ----------------
import SearchTableTemplate from "@/components/SearchTableTemplate.vue"

// ---------------- ECharts ----------------
import VChart from 'vue-echarts'
import '@/plugins/echarts' // 初始化 echarts modules

// ---------------- 虚拟滚动 ----------------
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css'
import VueVirtualScroller from 'vue3-virtual-scroller';

// ---------------- 创建 Vue App ----------------
const app = createApp(App)

// 注册插件顺序：Pinia 插件 -> Pinia -> 其他插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
// Element Plus 中文
app.use(ElementPlus, { locale: zhCn })
app.use(pinia)
// 路由
app.use(router)
// ---------------- 全局注册组件 ----------------
app.component('SearchTableTemplate', SearchTableTemplate)
app.component('v-chart', VChart)
//固定高度的虚拟列表

app.component('RecycleScroller', VueVirtualScroller.RecycleScroller);

// ---------------- 挂载 ----------------
app.mount('#app')