// src/ws/manager.ts
import { ServerWebSocket } from "bun";
import { db } from "../db/db";
import * as tables from "../db/schema";
import { desc } from "drizzle-orm";

export const clients = new Set<ServerWebSocket>();

export function broadcast(data: unknown) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Handle incoming WebSocket messages
export async function handleMessage(ws: ServerWebSocket, message: string) {
  try {
    const data = JSON.parse(message);

    switch (data.type) {
      case "projects:fetch":
        // Send all projects to this specific client
        const projects = await db
          .select()
          .from(tables.projectsTable)
          .orderBy(desc(tables.projectsTable.updatedAt));

        ws.send(
          JSON.stringify({
            type: "projects:data",
            payload: projects,
          })
        );
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}
