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


const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(elementPlus,{locale: zhCn}) // elementplus组件显示中文
app.use(pinia)
app.use(router)

app.component('SearchTableTemplate', SearchTableTemplate)
app.mount('#app')
