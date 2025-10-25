// oRPC Client - Type-safe RPC client for mobile
import { createORPCClient } from "@orpc/client";
// @ts-ignore - Metro resolver handles this path correctly
import { RPCLink } from "@orpc/client/dist/adapters/fetch";
import Config from '../constants/Config';

// Create RPC Link with fetch (works natively in React Native)
const rpcLink = new RPCLink({
  url: `${Config.apiUrl}/rpc`,
  headers: {
    "Content-Type": "application/json",
  },
  // Future: Add authentication headers
  // headers: () => ({
  //   Authorization: `Bearer ${getToken()}`,
  // }),
});

// Create type-safe oRPC client
export const orpcClient = createORPCClient(rpcLink) as any;
