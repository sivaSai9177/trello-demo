// hooks/useWebSocketStore.ts
import { useStore } from "@tanstack/react-store";
import { websocketStore } from "../stores/websocket.store";

export function useWebSocketStore() {
  return useStore(websocketStore);
}
