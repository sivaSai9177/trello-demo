import { useWebSocketStore } from "@/hooks/useWebSocketStore";

export function ConnectionStatus() {
  const statusConfig = {
    connecting: {
      color: "bg-yellow-500",
      text: "Connecting...",
      icon: "⟳",
    },
    connected: {
      color: "bg-green-500",
      text: "Connected",
      icon: "✓",
    },
    disconnected: {
      color: "bg-gray-500",
      text: "Disconnected",
      icon: "○",
    },
    error: {
      color: "bg-red-500",
      text: "Connection Error",
      icon: "✕",
    },
  };

  // Get WebSocket connection status from TanStack Store
  const { connectionStatus } = useWebSocketStore();

  const config = statusConfig[connectionStatus];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-lg">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-gray-200">{config.text}</span>
      <span className="text-xs">{config.icon}</span>
    </div>
  );
}
