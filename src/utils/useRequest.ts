import { onUnmounted, ref } from "vue"
import { throttle, debounce } from "lodash-es"

interface UseRequestOptionsType {
  immediate?: boolean;
  throttleTime?: number;
  debounceTime?: number;
  onSuccess?: (data?: any) => void;
  onError?: (err?: any) => void;
  intervalTime?: number; // 轮询的时间间隔
}

export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseRequestOptionsType = {}
) {
  const {
    immediate = false, // 是否立刻发出请求
    throttleTime = 0, // 节流时间
    debounceTime = 0,
    onSuccess, // 请求成功处理回调
    onError, // 请求失败处理回调
    intervalTime = -1 // 轮询间隔时间
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<any>(null)

  let timer: any = null

  const run = async (...args: any[]) => {
    loading.value = true
    error.value = null

    try {
      const res = await requestFn(...args)
      data.value = res
      onSuccess?.(res)
      return res
    } catch (err: any) {
      error.value = err
      onError?.(err)
      return Promise.reject(err)
    } finally {
      loading.value = false
    }
  }
  let runFn: (...args: any[]) => void = run
  // 优先使用 debounce
  if (debounceTime > 0) {
    runFn = debounce(run, debounceTime)
  }

  // 其次 throttle
  else if (throttleTime > 0) {
    runFn = throttle(run, throttleTime)
  }

  const refresh = () => run() // 刷新

  const startPolling = () => {
    // 开启轮询
    if (intervalTime <= 0 || timer) return
    run()
    timer = setInterval(() => {
      if (!loading.value) {
        run()
      }
    }, intervalTime)
  }

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
  }

  if (immediate) {
    run()
  }

  onUnmounted(() => {
    stopPolling() // 组件卸载时停止轮询
  })

  return {
    data,
    loading,
    error,
    runFn,
    refresh,
    reset,
    startPolling,
    stopPolling
  }
}