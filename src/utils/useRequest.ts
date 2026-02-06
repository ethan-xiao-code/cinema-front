import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { throttle } from "lodash-es";
interface UseRequestOptionsType {
  immediate?: boolean;      // 是否立即执行
  throttleTime?: number;    // 节流时间，单位ms
  onSuccess?: (data?: any) => void; // 成功的回调
  onError?: (data?: any) => void; // 失败的回调
}

/**
 * 简易 useRequest
 * @param requestFn Axios请求函数，返回Promise
 * @param options 配置
 */
export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseRequestOptionsType
) {
  const { immediate = false, throttleTime = 0, onSuccess,onError } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const run = async (...args: any[]) => {
    loading.value = true
    error.value = null

    try {
      const res: T = await requestFn(...args)
      data.value = res
      onSuccess?.(res)
      return res
    } catch (err: any) {
      error.value = err.message || '请求失败'
      onError?.(err)
      return Promise.reject(err)
    } finally {
      loading.value = false
    }
  }
  const throttleRun = throttle(run, throttleTime)
  const runFn = throttleTime > 0 ? throttleRun : run


  if (immediate) {
    runFn()
  }

  return {
    data,
    loading,
    error,
    runFn
  }
}
