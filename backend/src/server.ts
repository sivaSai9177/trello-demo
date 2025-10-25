// src/server.ts
import "dotenv/config";
import { clients, broadcast, handleMessage } from "./ws/manager";
import { initializeDatabaseListener, closeDatabaseListener } from "./db/db";
import app from "./index";

const server = Bun.serve({
  port: 3002,
  fetch(req, bunServer) {
    // Handle WebSocket upgrades
    if (bunServer.upgrade(req)) {
      return; // stop Hono from processing WebSocket requests
    }
    // Otherwise handle normal REST requests
    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      console.log("🔌 WebSocket connected:", clients.size, "clients");
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "Connected to server",
        })
      );
    },
    message(ws, message) {
      console.log("💬 Received message:", message);
      // Echo back or handle commands
      handleMessage(ws, message.toString());
    },
    close(ws) {
      clients.delete(ws);
      console.log("❌ WebSocket disconnected:", clients.size, "clients");
    },
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);

// Initialize PostgreSQL LISTEN for real-time database change notifications
initializeDatabaseListener(broadcast).catch((err) => {
  console.error("Failed to start database listener:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await closeDatabaseListener();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await closeDatabaseListener();
  process.exit(0);
});
