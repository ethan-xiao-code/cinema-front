import { onUnmounted, ref } from "vue";
import { throttle, debounce } from "lodash-es";

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
    immediate = false,
    throttleTime = 0,
    debounceTime = 0,
    onSuccess,
    onError,
    intervalTime = -1
  } = options;

  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<any>(null);

  let timer: any = null;
  let latestRequestId = 0; // 最新请求标识符

  const run = async (...args: any[]) => {
    loading.value = true;
    error.value = null;

    const requestId = ++latestRequestId; // 当前请求id

    try {
      const res = await requestFn(...args);

      // 检查是否为最新请求
      if (requestId === latestRequestId) {
        data.value = res;
        onSuccess?.(res);
      }

      return res;
    } catch (err: any) {
      if (requestId === latestRequestId) {
        error.value = err;
        onError?.(err);
      }
      return Promise.reject(err);
    } finally {
      // 只在最新请求完成时关闭 loading
      if (requestId === latestRequestId) {
        loading.value = false;
      }
    }
  };

  let runFn: (...args: any[]) => void = run;

  if (debounceTime > 0) {
    runFn = debounce(run, debounceTime);
  } else if (throttleTime > 0) {
    runFn = throttle(run, throttleTime);
  }

  const refresh = () => runFn();

  const startPolling = () => {
    if (intervalTime <= 0 || timer) return;
    run();
    timer = setInterval(() => {
      if (!loading.value) run();
    }, intervalTime);
  };

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const reset = () => {
    data.value = null;
    error.value = null;
    loading.value = false;
    latestRequestId = 0;
  };

  if (immediate) run();

  onUnmounted(() => {
    stopPolling();
  });

  return {
    data,
    loading,
    error,
    runFn,
    refresh,
    reset,
    startPolling,
    stopPolling
  };
}