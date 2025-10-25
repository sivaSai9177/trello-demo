import { Hono } from "hono";
import { commentsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db";
import { broadcast } from "../ws/manager";

export const commentsRoute = new Hono();

// ----------------------
// Validation Schemas
// ----------------------
const commentCreateSchema = z.object({
  taskId: z.number(),
  text: z.string().min(1, "Comment text is required"),
});

const commentUpdateSchema = z.object({
  text: z.string().min(1).optional(),
});

// ----------------------
// Routes
// ----------------------

// Get all comments
commentsRoute.get("/", async (c) => {
  const comments = await db.select().from(commentsTable);
  return c.json(comments);
});

// Get comments for a specific task
commentsRoute.get("/task/:taskId", async (c) => {
  const taskId = Number(c.req.param("taskId"));
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.taskId, taskId));

  return c.json(comments);
});

// Create a comment
commentsRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [newComment] = await db
    .insert(commentsTable)
    .values(parsed.data)
    .returning();

  // Broadcast new comment to all connected clients
  broadcast({
    type: "comment:created",
    payload: newComment,
  });

  return c.json(newComment, 201);
});

// Update a comment
commentsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const parsed = commentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [updated] = await db
    .update(commentsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(commentsTable.id, id))
    .returning();

  if (!updated) return c.json({ error: "Comment not found" }, 404);

  // Broadcast updated comment to all connected clients
  broadcast({
    type: "comment:updated",
    payload: updated,
  });

  return c.json(updated);
});

// Delete a comment
commentsRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [deleted] = await db
    .delete(commentsTable)
    .where(eq(commentsTable.id, id))
    .returning();

  if (!deleted) return c.json({ error: "Comment not found" }, 404);

  // Broadcast comment deletion to all connected clients
  broadcast({
    type: "comment:deleted",
    payload: { id },
  });

  return c.json({ message: "Comment deleted successfully" });
});
