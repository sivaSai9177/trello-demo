import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { initWebSocket, cleanupWebSocket } from '../../stores/websocket.store'

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  // Initialize WebSocket with TanStack Store
  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3002"
    initWebSocket(WS_URL, queryClient)

    return () => {
      cleanupWebSocket()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
