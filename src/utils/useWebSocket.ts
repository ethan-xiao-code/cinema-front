// utils/useWebSocket.ts
import { ref, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores";

type WSMessageHandler = (msg: any) => void;
const baseWsUrl = 'ws://localhost:8080'
type WebScoketType = {
  path: string;
  onMessage?: (msg: any) => void;
  params?: Record<string,any>;
}
export function useWebSocket(props: WebScoketType) {
  const {path,onMessage,params} = props
  const userStore = useUserStore();
  const ws = ref<WebSocket | null>(null);
  const connected = ref(false);
  const initWebSocket = () => {
    if (!userStore.token) {
      console.warn("WebSocket: token 未找到");
      return;
    }
    let newUrl = `${baseWsUrl}${path}`
    
    if(params){
      newUrl+=`?${new URLSearchParams(params).toString()}`
    }
    ws.value = new WebSocket(`${newUrl}`);

    ws.value.onopen = () => {
      connected.value = true;
      console.log("✅ WebSocket 已连接");
    };

    ws.value.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage?.(msg);
      } catch (err) {
        console.error("WebSocket 消息解析失败", err);
      }
    };

    ws.value.onclose = () => {
      connected.value = false;
      console.log("❌ WebSocket 已断开");
      // 可选：自动重连
      // setTimeout(initWebSocket, 3000);
    };

    ws.value.onerror = (err) => {
      console.error("WebSocket 错误", err);
      ws.value?.close();
    };
  };

  const send = (data: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket 未连接，消息未发送", data);
      return;
    }
    ws.value.send(JSON.stringify(data));
  };

  const close = () => {
    ws.value?.close();
    ws.value = null;
    connected.value = false;
  };

  onBeforeUnmount(() => {
    close();
  });

  return {
    ws,
    connected,
    initWebSocket,
    send,
    close,
  };
}
