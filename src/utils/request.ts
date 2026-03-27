import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { eventBus } from './eventBus'

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  isShowMsg: boolean;
}

// 创建并初始化axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 基础地址
  timeout: 1000 * 60 // 请求时间超过60s就失败
})

// 请求拦截器
service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useUserStore()
    const token = store.token

    // 将token放在请求头中
    if (token) {
      config.headers.Authorization = token
    }
    // 延迟 0.3 秒
    await new Promise(resolve => setTimeout(resolve, 300))
    return config
  },
  (error: any) => {
    // 失败执行promise
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果是 Blob 类型（如下载文件），直接返回
    if (response.data instanceof Blob) {
      return response
    }
    const { data, message, code,isShowMsg } = response.data as ApiResponse

    if (code === 1) {
      // 表示响应成功
      return data
    } else {
      // 业务逻辑错误，提示错误信息
      isShowMsg && ElMessage({
        type: 'error',
        message: message
      })
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  async (error: any) => {
    const store = useUserStore()
    let msg = error.message || '请求失败'
    const status = error.response?.status

    if (status === 401) {
      // 表示token过期了,清空用户信息并跳转到登录页面
      const data = {
        roleId: store.roleId,
        userId: store.userId
      }

      await store.logoutAction(data)

      msg = '非法登录，请重新登录'
      // router.push('/login')
      eventBus.emit("showLoginDialog",{})
    } else if (status >= 500) {
      msg = '服务器出错啦'
    } else if (status >= 400) {
      msg = error.response?.data?.message || '客户端请求有误'
    }

    ElMessage({
      type: 'error',
      message: msg
    })

    return Promise.reject(error)
  }
)

export default service
