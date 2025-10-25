// Comments RPC Procedures
import { os } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import * as tables from "../../db/schema";
import type { Context } from "../context";

// Validation schemas
const commentCreateSchema = z.object({
  taskId: z.number(),
  text: z.string().min(1, "Comment text is required"),
});

const commentUpdateSchema = z.object({
  text: z.string().min(1).optional(),
});

const commentIdSchema = z.object({
  id: z.number(),
});

const taskIdSchema = z.object({
  taskId: z.number(),
});

// Create base procedure with context
const baseProcedure = os.$context<Context>();

export const commentsRouter = {
  // Get all comments
  getAll: baseProcedure.handler(async ({ context }) => {
    const comments = await context.db.select().from(tables.commentsTable);
    return comments;
  }),

  // Get comments by task ID
  getByTaskId: baseProcedure
    .input(taskIdSchema)
    .handler(async ({ input, context }) => {
      const comments = await context.db
        .select()
        .from(tables.commentsTable)
        .where(eq(tables.commentsTable.taskId, input.taskId));

      return comments;
    }),

  // Create comment
  create: baseProcedure
    .input(commentCreateSchema)
    .handler(async ({ input, context }) => {
      const [newComment] = await context.db
        .insert(tables.commentsTable)
        .values(input)
        .returning();

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "comment:created",
        payload: newComment,
      });

      return newComment;
    }),

  // Update comment
  update: baseProcedure
    .input(
      z.object({
        id: z.number(),
        data: commentUpdateSchema,
      })
    )
    .handler(async ({ input, context }) => {
      const [updated] = await context.db
        .update(tables.commentsTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(tables.commentsTable.id, input.id))
        .returning();

      if (!updated) {
        throw new Error("Comment not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "comment:updated",
        payload: updated,
      });

      return updated;
    }),

  // Delete comment
  delete: baseProcedure
    .input(commentIdSchema)
    .handler(async ({ input, context }) => {
      const [deleted] = await context.db
        .delete(tables.commentsTable)
        .where(eq(tables.commentsTable.id, input.id))
        .returning();

      if (!deleted) {
        throw new Error("Comment not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "comment:deleted",
        payload: { id: input.id },
      });

      return deleted;
    }),
};
