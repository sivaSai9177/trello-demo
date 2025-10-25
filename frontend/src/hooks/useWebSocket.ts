// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  message?: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWebSocket(url: string) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  const connect = useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionStatus("connecting");
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionStatus("connected");

      // Reset reconnect attempts on successful connection
      reconnectAttemptsRef.current = 0;

      // Request initial projects data
      ws.send(JSON.stringify({ type: "projects:fetch" }));

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
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
              console.log("📦 Current cache:", old); // ADD THIS
              const updated = old.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
              );
              console.log("📦 Updated cache:", updated); // ADD THIS
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
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setConnectionStatus("disconnected");

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
      reconnectAttemptsRef.current++;
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);

      console.log(`🔄 Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current})...`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, backoffDelay);
    };

    wsRef.current = ws;
  }, [url, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  return { sendMessage, connectionStatus };
}
