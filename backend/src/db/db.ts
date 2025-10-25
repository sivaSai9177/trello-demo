import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema";

const { Pool, Client } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Pool for regular database operations
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Drizzle instance for queries
export const db = drizzle(pool, { schema });

// Dedicated client for LISTEN/NOTIFY
let listenerClient: typeof Client.prototype | null = null;

export async function initializeDatabaseListener(
  broadcastFn: (data: unknown) => void
) {
  try {
    listenerClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await listenerClient.connect();
    console.log("📡 Database listener connected");

    // Listen to all table change channels
    await listenerClient.query("LISTEN projects_changes");
    await listenerClient.query("LISTEN tasks_changes");
    await listenerClient.query("LISTEN comments_changes");

    console.log("👂 Listening to database changes: projects, tasks, comments");

    // Handle notifications
    listenerClient.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload || "{}");
        const { table, operation, record } = payload;

        console.log(`🔔 DB Change: ${table} - ${operation}`, record);

        // Map database operations to WebSocket event types
        let eventType: string;
        switch (table) {
          case "projects":
            eventType =
              operation === "INSERT"
                ? "project:created"
                : operation === "UPDATE"
                  ? "project:updated"
                  : "project:deleted";
            break;
          case "tasks":
            eventType =
              operation === "INSERT"
                ? "task:created"
                : operation === "UPDATE"
                  ? "task:updated"
                  : "task:deleted";
            break;
          case "comments":
            eventType =
              operation === "INSERT"
                ? "comment:created"
                : operation === "UPDATE"
                  ? "comment:updated"
                  : "comment:deleted";
            break;
          default:
            console.log("Unknown table:", table);
            return;
        }

        // Broadcast to all WebSocket clients
        broadcastFn({
          type: eventType,
          payload: operation === "DELETE" ? { id: record.id } : record,
        });
      } catch (error) {
        console.error("Error handling database notification:", error);
      }
    });

    listenerClient.on("error", (err) => {
      console.error("❌ Database listener error:", err);
    });

    listenerClient.on("end", () => {
      console.log("🔌 Database listener disconnected");
    });
  } catch (error) {
    console.error("Failed to initialize database listener:", error);
    throw error;
  }
}

export async function closeDatabaseListener() {
  if (listenerClient) {
    await listenerClient.end();
    listenerClient = null;
    console.log("Database listener closed");
  }
}
