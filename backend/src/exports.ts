/**
 * Main exports file for @your-org/trello-backend-types package
 *
 * This file exports all types, schemas, and router definitions
 * that frontend applications need to work with the backend API.
 *
 * Usage in frontend:
 * ```typescript
 * import type { AppRouter, Project, Task } from '@your-org/trello-backend-types';
 * import { projectSchema } from '@your-org/trello-backend-types';
 * import { createORPCClient } from '@orpc/client';
 *
 * const client = createORPCClient<AppRouter>(link);
 * ```
 */

// ===========================
// 1. Router Types (for oRPC client)
// ===========================
export { appRouter } from "./rpc/index";
export type { AppRouter } from "./rpc/index";

// ===========================
// 2. Database Types
// ===========================
export type {
  Project,
  Task,
  Comment,
  User,
  ProjectInsert,
  TaskInsert,
  CommentInsert,
  UserInsert,
  TaskStatus,
  TaskPriority,
  WebSocketEventType,
  WebSocketEvent,
} from "./types";

// ===========================
// 3. Validation Schemas (Zod)
// ===========================

// Project schemas
export {
  projectSchema,
  projectIdSchema,
  projectUpdateSchema,
} from "./schemas/project.schema";
export type {
  ProjectInput,
  ProjectIdInput,
  ProjectUpdateInput,
} from "./schemas/project.schema";

// Task schemas
export {
  taskCreateSchema,
  taskUpdateSchema,
  taskIdSchema,
  taskUpdateInputSchema,
} from "./schemas/task.schema";
export type {
  TaskCreateInput,
  TaskUpdateInput,
  TaskIdInput,
  TaskUpdateFullInput,
} from "./schemas/task.schema";

// Comment schemas
export {
  commentCreateSchema,
  commentUpdateSchema,
  commentIdSchema,
  commentTaskIdSchema,
  commentUpdateInputSchema,
} from "./schemas/comment.schema";
export type {
  CommentCreateInput,
  CommentUpdateInput,
  CommentIdInput,
  CommentTaskIdInput,
  CommentUpdateFullInput,
} from "./schemas/comment.schema";

// ===========================
// 4. Database Schema Tables (optional - for advanced usage)
// ===========================
export {
  projectsTable,
  tasksTable,
  commentsTable,
  usersTable,
  taskStatusEnum,
  taskPriorityEnum,
} from "./db/schema";
