// 导入Vue的生命周期钩子和响应式API
import { onUnmounted, ref } from "vue"
// 导入lodash的节流、防抖函数（处理高频触发场景）
import { throttle, debounce } from "lodash-es"

/**
 * 请求配置项的类型定义（TypeScript接口）
 * 约束useRequest函数的第二个参数格式
 */
interface UseRequestOptionsType {
  immediate?: boolean;         // 是否在初始化时立即执行请求，默认false
  throttleTime?: number;       // 节流时间（毫秒），默认0（不节流）
  debounceTime?: number;       // 防抖时间（毫秒），默认0（不防抖）
  onSuccess?: (data?: any) => void; // 请求成功的回调函数，接收返回数据
  onError?: (err?: any) => void;    // 请求失败的回调函数，接收错误信息
  intervalTime?: number;       // 轮询时间间隔（毫秒），默认-1（不开启轮询）
  delay?: number;              // 单次请求的延迟执行时间（毫秒），默认500
}

/**
 * 通用的Vue请求Hook（封装异步请求的核心逻辑）
 * 支持：竞态处理、防抖/节流、轮询、延迟执行、状态管理、成功/失败回调
 * @template T - 请求返回数据的类型（泛型，默认any）
 * @param requestFn - 实际的异步请求函数（如axios/fetch请求）
 * @param options - 请求配置项，见UseRequestOptionsType接口
 * @returns 包含请求状态和操作函数的对象
 */
export function useRequest<T = any>(
  requestFn: (...args: any[]) => Promise<T>, // 入参：异步请求函数，支持透传多个参数
  options: UseRequestOptionsType = {}        // 入参：请求配置项，默认空对象
) {
  // 解构配置项，设置默认值（未传参时使用）
  const {
    immediate = false,     // 默认不立即执行请求
    throttleTime = 0,    // 默认不节流
    debounceTime = 0,     // 默认不防抖
    onSuccess,            // 成功回调（外部传入）
    onError,              // 失败回调（外部传入）
    intervalTime = -1,    // 默认不开启轮询
    delay = 500           // 默认单次请求延迟500ms执行
  } = options

  // ========== 响应式状态管理（供外部组件使用） ==========
  const data = ref<T | null>(null)    // 存储请求成功返回的数据，初始null
  const loading = ref(false)          // 请求加载状态：true=请求中，false=请求结束
  const error = ref<any>(null)        // 存储请求失败的错误信息，初始null

  // ========== 内部变量（用于控制请求逻辑） ==========
  let timer: any = null               // 轮询定时器标识，用于清除轮询
  let latestRequestId = 0             // 请求ID计数器，解决请求竞态问题

  /**
   * 核心请求执行函数（内部）
   * 处理单次请求的完整逻辑：状态管理、竞态控制、延迟执行、结果处理
   * @param args - 透传给requestFn的参数（如接口入参）
   * @returns Promise<T> - 让外部可以用async/await接收结果
   */
  const run = (...args: any[]) => {
    // 1. 生成当前请求的唯一ID（每次调用run自增1），标记本次请求
    const currentId = ++latestRequestId

    // 2. 初始化请求状态：开启加载、清空历史错误
    loading.value = true  // 标记请求开始
    error.value = null    // 清空上一次的错误信息

    // 3. 返回Promise，兼容外部async/await调用
    return new Promise<T>((resolve, reject) => {
      // 4. 延迟指定时间后执行实际请求（支持延迟执行，配合防抖/节流）
      setTimeout(async () => {
        try {
          // 5. 执行实际的异步请求，透传所有入参给requestFn
          const res = await requestFn(...args)

          // 关键判断：如果当前请求不是最新请求（有新请求已发起），直接终止
          // 解决竞态问题：避免旧请求覆盖新请求的结果
          if (currentId !== latestRequestId) return

          // 6. 只有最新请求的成功结果才生效
          data.value = res       // 更新响应式数据
          onSuccess?.(res)       // 执行外部传入的成功回调（?. 避免回调未定义报错）
          resolve(res)           // Promise状态置为成功，返回结果

        } catch (err: any) {
          // 7. 捕获请求错误（如网络错误、接口报错）
          // 同样判断：旧请求的错误不处理
          if (currentId !== latestRequestId) return

          // 8. 只有最新请求的错误才生效
          error.value = err      // 更新响应式错误信息
          onError?.(err)         // 执行外部传入的失败回调
          reject(err)            // Promise状态置为失败，抛出错误

        } finally {
          // 9. 无论请求成功/失败，只有最新请求才关闭加载状态
          if (currentId === latestRequestId) {
            loading.value = false // 标记请求结束
          }
        }
      }, delay)  // 单次请求的延迟执行时间（毫秒）
    })
  }

  // ========== 防抖/节流处理（优先防抖，其次节流） ==========
  // 初始化执行函数为原始run函数
  let runFn: (...args: any[]) => void = run

  // 如果配置了防抖时间，给run函数添加防抖处理（高频触发时只执行最后一次）
  if (debounceTime > 0) {
    runFn = debounce(runFn, debounceTime)
  }
  // 如果没配置防抖但配置了节流，给run函数添加节流处理（高频触发时固定频率执行）
  else if (throttleTime > 0) {
    runFn = throttle(runFn, throttleTime)
  }

  /**
   * 刷新请求（外部调用）
   * 本质是调用处理后的runFn，无参刷新
   */
  const refresh = () => runFn()

  /**
   * 开启轮询请求（外部调用）
   * 按指定intervalTime间隔重复执行请求，避免请求叠加
   */
  const startPolling = () => {
    // 防护：轮询时间<=0 或 已有定时器时，不执行
    if (intervalTime <= 0 || timer) return
    // 先执行一次请求
    runFn()
    // 设置轮询定时器：上一次请求结束后（loading=false）才执行下一次
    timer = setInterval(() => {
      if (!loading.value) {
        runFn()
      }
    }, intervalTime)
  }

  /**
   * 停止轮询请求（外部调用）
   * 清除轮询定时器，重置timer标识
   */
  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)  // 清除定时器
      timer = null          // 重置定时器标识
    }
  };

  /**
   * 重置请求状态（外部调用）
   * 将data、error、loading恢复为初始值
   */
  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
    latestRequestId = 0
  }

  // ========== 初始化逻辑 ==========
  // 如果配置了immediate=true，初始化时立即执行请求
  if (immediate) {
    runFn()
  }

  // ========== 生命周期钩子 ==========
  // 组件卸载时自动停止轮询，避免内存泄漏
  onUnmounted(() => {
    stopPolling()
  })

  // ========== 返回外部可用的状态和方法 ==========
  return {
    data,          // 请求返回的响应式数据
    loading,       // 请求加载状态（响应式）
    error,         // 请求错误信息（响应式）
    runFn,         // 带防抖/节流的请求执行函数（可传参）
    refresh,       // 无参刷新请求函数
    reset,         // 重置请求状态函数
    startPolling,  // 开启轮询函数
    stopPolling    // 停止轮询函数
  }
}