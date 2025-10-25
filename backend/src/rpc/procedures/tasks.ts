// Tasks RPC Procedures
import { os } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import * as tables from "../../db/schema";
import type { Context } from "../context";
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskIdSchema,
} from "../../schemas/task.schema";

// Create base procedure with context
const baseProcedure = os.$context<Context>();

export const tasksRouter = {
  // Get all tasks
  getAll: baseProcedure.handler(async ({ context }) => {
    const tasks = await context.db.select().from(tables.tasksTable);
    return tasks;
  }),

  // Get task by ID
  getById: baseProcedure
    .input(taskIdSchema)
    .handler(async ({ input, context }) => {
      const [task] = await context.db
        .select()
        .from(tables.tasksTable)
        .where(eq(tables.tasksTable.id, input.id));

      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    }),

  // Create task
  create: baseProcedure
    .input(taskCreateSchema)
    .handler(async ({ input, context }) => {
      const [newTask] = await context.db
        .insert(tables.tasksTable)
        .values(input)
        .returning();

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "task:created",
        payload: newTask,
      });

      return newTask;
    }),

  // Update task
  update: baseProcedure
    .input(
      z.object({
        id: z.number(),
        data: taskUpdateSchema,
      })
    )
    .handler(async ({ input, context }) => {
      const [updated] = await context.db
        .update(tables.tasksTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(tables.tasksTable.id, input.id))
        .returning();

      if (!updated) {
        throw new Error("Task not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "task:updated",
        payload: updated,
      });

      return updated;
    }),

  // Delete task
  delete: baseProcedure
    .input(taskIdSchema)
    .handler(async ({ input, context }) => {
      const [deleted] = await context.db
        .delete(tables.tasksTable)
        .where(eq(tables.tasksTable.id, input.id))
        .returning();

      if (!deleted) {
        throw new Error("Task not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "task:deleted",
        payload: { id: input.id },
      });

      return deleted;
    }),
};
