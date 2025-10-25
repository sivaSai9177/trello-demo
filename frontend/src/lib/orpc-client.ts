// oRPC Client - Type-safe RPC client for frontend
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

// Lazy initialization to avoid SSR issues
let _orpcClient: any = null;
let _rpcLink: any = null;

function getOrpcClient() {
  // Only create client on the browser (client-side)
  if (typeof window === "undefined") {
    // Return a mock client for SSR that throws helpful errors
    return new Proxy({}, {
      get() {
        throw new Error("oRPC client cannot be used during SSR. Use server functions instead.");
      }
    });
  }

  if (!_orpcClient) {
    // Create RPC Link with fetch (only on client)
    _rpcLink = new RPCLink({
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
    _orpcClient = createORPCClient(_rpcLink as any) as any;
  }

  return _orpcClient;
}

// Export client getter
export const orpcClient = new Proxy({} as any, {
  get(_target, prop) {
    return getOrpcClient()[prop];
  }
});

// Create TanStack Query utils for React hooks
export const orpc = new Proxy({} as any, {
  get(_target, prop) {
    if (!_orpcClient) {
      getOrpcClient();
    }
    const utils = createTanstackQueryUtils(_orpcClient) as any;
    return utils[prop];
  }
});
