import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import SearchTableTemplate from "@/components/SearchTableTemplate.vue";
import '@/utils/rem.js'
import elementPlus from 'element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import VChart from 'vue-echarts'
// 初始化 echarts 所需模块（charts + components + renderer）
import '@/plugins/echarts'


const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(elementPlus,{locale: zhCn}) // elementplus组件显示中文
app.use(pinia)
app.use(router)
app.component('SearchTableTemplate', SearchTableTemplate)
// 全局注册 vue-echarts 组件
app.component('v-chart', VChart)
app.mount('#app')
