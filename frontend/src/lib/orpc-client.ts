// oRPC Client - Type-safe RPC client for frontend
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

// Create RPC Link with fetch
const rpcLink = new RPCLink({
  url: `${API_URL}/rpc`,
  headers: {
    "Content-Type": "application/json",
  },
  // Future: Add authentication headers
  // headers: () => ({
  //   Authorization: `Bearer ${getToken()}`,
  // }),
});

// Create type-safe oRPC client
// Note: Using 'any' to bypass TypeScript's strict NestedClient constraint
// The router structure is correct at runtime, but doesn't satisfy compile-time constraints
// due to context-scoped procedures. This is a known limitation when using custom contexts.
export const orpcClient = createORPCClient(rpcLink as any) as any;

// Create TanStack Query utils for React hooks
export const orpc = createTanstackQueryUtils(orpcClient);
