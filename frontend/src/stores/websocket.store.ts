// stores/websocket.store.ts
import { Store } from "@tanstack/store";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@trello-demo/shared";

interface WebSocketMessage {
  type: string;
  payload?: any;
  message?: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface WebSocketState {
  connectionStatus: ConnectionStatus;
  reconnectAttempts: number;
}

// Create the global WebSocket store
export const websocketStore = new Store<WebSocketState>({
  connectionStatus: "connecting",
  reconnectAttempts: 0,
});

// WebSocket singleton
let wsInstance: WebSocket | null = null;
let reconnectTimeoutId: NodeJS.Timeout | undefined = undefined;
let heartbeatIntervalId: NodeJS.Timeout | undefined = undefined;

// Initialize WebSocket connection
export function initWebSocket(url: string, queryClient: any) {
  // Clear any existing reconnect timeout
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId);
  }

  websocketStore.setState((state) => ({
    ...state,
    connectionStatus: "connecting",
  }));

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
    websocketStore.setState((state) => ({
      ...state,
      connectionStatus: "connected",
      reconnectAttempts: 0,
    }));

    // Request initial projects data
    ws.send(JSON.stringify({ type: "projects:fetch" }));

    // Start heartbeat - keeps connection alive
    heartbeatIntervalId = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Ping every 30 seconds
  };

  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("📨 Received:", message);

      switch (message.type) {
        case "projects:data":
          // Set initial data in React Query cache
          const projects = message.payload.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          queryClient.setQueryData(["projects"], projects);
          break;

        case "project:created":
          // Optimistically add new project to cache
          const newProject = {
            ...message.payload,
            createdAt: new Date(message.payload.createdAt),
            updatedAt: new Date(message.payload.updatedAt),
          };
          queryClient.setQueryData(["projects"], (old: Project[] = []) => {
            return [newProject, ...old];
          });

          // Invalidate to refetch if needed
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          break;

        case "project:updated":
          // Update specific project in cache
          const updatedProject = {
            ...message.payload,
            createdAt: new Date(message.payload.createdAt),
            updatedAt: new Date(message.payload.updatedAt),
          };
          queryClient.setQueryData(["projects"], (old: Project[] = []) => {
            console.log("📦 Current cache:", old);
            const updated = old.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            );
            console.log("📦 Updated cache:", updated);
            return updated;
          });

          // Force UI update
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          break;

        case "project:deleted":
          // Remove deleted project from cache
          queryClient.setQueryData(["projects"], (old: Project[] = []) => {
            return old.filter((p) => p.id !== message.payload.id);
          });

          // Remove individual project cache
          queryClient.removeQueries({
            queryKey: ["projects", message.payload.id],
          });
          break;

        case "connected":
          console.log(message.message);
          break;

        case "pong":
          // Heartbeat response received
          console.log("💓 Heartbeat acknowledged");
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
    websocketStore.setState((state) => ({
      ...state,
      connectionStatus: "error",
    }));
  };

  ws.onclose = () => {
    console.log("🔌 WebSocket disconnected");
    websocketStore.setState((state) => ({
      ...state,
      connectionStatus: "disconnected",
    }));

    // Clear heartbeat interval
    if (heartbeatIntervalId) {
      clearInterval(heartbeatIntervalId);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const currentAttempts = websocketStore.state.reconnectAttempts + 1;
    websocketStore.setState((state) => ({
      ...state,
      reconnectAttempts: currentAttempts,
    }));

    const backoffDelay = Math.min(1000 * Math.pow(2, currentAttempts - 1), 30000);

    console.log(`🔄 Reconnecting in ${backoffDelay}ms (attempt ${currentAttempts})...`);

    reconnectTimeoutId = setTimeout(() => {
      initWebSocket(url, queryClient);
    }, backoffDelay);
  };

  wsInstance = ws;
}

// Send message through WebSocket
export function sendWebSocketMessage(message: any) {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket is not connected");
  }
}

// Cleanup function
export function cleanupWebSocket() {
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId);
  }
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
  }
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
}
