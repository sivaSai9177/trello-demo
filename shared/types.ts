// Auto-generated types from Drizzle schema
// Types are inferred using TypeScript's InferSelectModel from the backend schema
// This ensures types stay in sync with the database schema automatically

import type { InferSelectModel } from "drizzle-orm";
import type {
  projectsTable,
  tasksTable,
  commentsTable,
  usersTable,
} from "@trello-demo/backend/db/schema";

// Infer types from Drizzle schema - these automatically update when schema changes
export type Project = InferSelectModel<typeof projectsTable>;
export type Task = InferSelectModel<typeof tasksTable>;
export type Comment = InferSelectModel<typeof commentsTable>;
export type User = InferSelectModel<typeof usersTable>;

// Optional: Insert types (for create operations)
export type ProjectInsert = typeof projectsTable.$inferInsert;
export type TaskInsert = typeof tasksTable.$inferInsert;
export type CommentInsert = typeof commentsTable.$inferInsert;
export type UserInsert = typeof usersTable.$inferInsert;
