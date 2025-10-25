// stores/websocket.store.ts - Network-aware WebSocket store for React Native
import { Store } from "@tanstack/store";
import { AppState, AppStateStatus } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import type { Project } from "@your-org/trello-backend-types";

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
let reconnectTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
let heartbeatIntervalId: ReturnType<typeof setInterval> | undefined = undefined;
let netInfoUnsubscribe: (() => void) | undefined = undefined;
let appStateSubscription: any = undefined;

// Initialize WebSocket connection with network awareness
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
            // Check if project already exists to prevent duplicates
            const exists = old.some(p => p.id === newProject.id);
            if (exists) {
              return old.map(p => p.id === newProject.id ? newProject : p);
            }
            return [newProject, ...old];
          });
          break;

        case "project:updated":
          // Update specific project in cache
          const updatedProject = {
            ...message.payload,
            createdAt: new Date(message.payload.createdAt),
            updatedAt: new Date(message.payload.updatedAt),
          };
          queryClient.setQueryData(["projects"], (old: Project[] = []) => {
            return old.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            );
          });
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

  // Listen to network changes (React Native specific)
  netInfoUnsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable && !wsInstance) {
      console.log('📡 Network restored, reconnecting WebSocket...');
      initWebSocket(url, queryClient);
    }
  });

  // Listen to app state changes (React Native specific)
  appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && !wsInstance) {
      console.log('📱 App became active, checking WebSocket connection...');
      // Check if we need to reconnect
      NetInfo.fetch().then(state => {
        if (state.isConnected && state.isInternetReachable) {
          initWebSocket(url, queryClient);
        }
      });
    } else if (nextAppState === 'background') {
      console.log('📱 App went to background');
      // Keep connection alive or close gracefully
      // For now, we'll keep it alive
    }
  });
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
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
}
