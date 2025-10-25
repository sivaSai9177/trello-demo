import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// --------------------
// ENUMS
// --------------------
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

// --------------------
// USERS TABLE (optional, no auth yet)
// --------------------
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// --------------------
// PROJECTS TABLE
// --------------------
export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// --------------------
// TASKS TABLE
// --------------------
export const tasksTable = pgTable("tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer()
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  status: taskStatusEnum().default("todo").notNull(),
  priority: taskPriorityEnum().default("medium").notNull(),
  assigneeId: integer().references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// --------------------
// COMMENTS TABLE
// --------------------
export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  taskId: integer()
    .notNull()
    .references(() => tasksTable.id, { onDelete: "cascade" }),
  text: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  tasks: many(tasksTable),
}));

export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  comments: many(commentsTable),
  assignee: one(usersTable, {
    fields: [tasksTable.assigneeId],
    references: [usersTable.id],
  }),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [commentsTable.taskId],
    references: [tasksTable.id],
  }),
}));
