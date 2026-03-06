import { ref } from "vue"
import { throttle } from "lodash-es"

interface UseRequestOptionsType {
  immediate?: boolean
  throttleTime?: number
  onSuccess?: (data?: any) => void
  onError?: (err?: any) => void
}

export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseRequestOptionsType = {}
) {
  const { immediate = false, throttleTime = 0, onSuccess, onError } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<any>(null)

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

  const runFn =
    throttleTime > 0
      ? throttle(run, throttleTime, { trailing: false })
      : run

  const refresh = () => run()

  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
  }

  if (immediate) {
    run()
  }

  return {
    data,
    loading,
    error,
    runFn,
    refresh,
    reset
  }
}