// Database types inferred from Drizzle schema
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  projectsTable,
  tasksTable,
  commentsTable,
  usersTable,
} from "./db/schema";

// Select types (reading from database)
export type Project = InferSelectModel<typeof projectsTable>;
export type Task = InferSelectModel<typeof tasksTable>;
export type Comment = InferSelectModel<typeof commentsTable>;
export type User = InferSelectModel<typeof usersTable>;

// Insert types (writing to database)
export type ProjectInsert = InferInsertModel<typeof projectsTable>;
export type TaskInsert = InferInsertModel<typeof tasksTable>;
export type CommentInsert = InferInsertModel<typeof commentsTable>;
export type UserInsert = InferInsertModel<typeof usersTable>;

// Task status and priority enums (matching database enums)
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

// WebSocket event types for real-time updates
export type WebSocketEventType =
  | "project:created"
  | "project:updated"
  | "project:deleted"
  | "task:created"
  | "task:updated"
  | "task:deleted"
  | "comment:created"
  | "comment:updated"
  | "comment:deleted";

export type WebSocketEvent = {
  type: WebSocketEventType;
  payload: any;
};
