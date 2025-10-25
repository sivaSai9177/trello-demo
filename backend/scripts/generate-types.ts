#!/usr/bin/env bun
// Script to generate shared types from Drizzle schema
// Run: bun run generate:types

import { writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = join(__dirname, "../../shared/types.ts");

const content = `// Auto-generated types from Drizzle schema
// DO NOT EDIT MANUALLY - Run \`bun run generate:types\` in backend to regenerate
// Generated at: ${new Date().toISOString()}

import type { InferSelectModel } from "drizzle-orm";
import type {
  projectsTable,
  tasksTable,
  commentsTable,
  usersTable,
} from "../backend/src/db/schema";

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
`;

writeFileSync(OUTPUT_PATH, content, "utf-8");

console.log("✅ Types generated successfully!");
console.log(`📄 Output: ${OUTPUT_PATH}`);
