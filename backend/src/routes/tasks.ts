import { Hono } from "hono";
import { tasksTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db";
import { broadcast } from "../ws/manager";

export const tasksRoute = new Hono();

// ----------------------
// Validation Schemas
// ----------------------
const taskCreateSchema = z.object({
  projectId: z.number(),
  title: z.string().min(1, "Title is required"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigneeId: z.number().optional().nullable(),
});

const taskUpdateSchema = taskCreateSchema.partial();

tasksRoute.get("/", async (c) => {
  const tasks = await db.select().from(tasksTable);
  return c.json(tasks);
});

tasksRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id));

  if (!task) return c.json({ error: "Task not found" }, 404);
  return c.json(task);
});

// Create new task
tasksRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [newTask] = await db.insert(tasksTable).values(parsed.data).returning();

  // Broadcast new task to all connected clients
  broadcast({
    type: "task:created",
    payload: newTask,
  });

  return c.json(newTask, 201);
});

// Update a task
tasksRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [updated] = await db
    .update(tasksTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasksTable.id, id))
    .returning();

  if (!updated) return c.json({ error: "Task not found" }, 404);

  // Broadcast updated task to all connected clients
  broadcast({
    type: "task:updated",
    payload: updated,
  });

  return c.json(updated);
});

// Delete a task
tasksRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [deleted] = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, id))
    .returning();

  if (!deleted) return c.json({ error: "Task not found" }, 404);

  // Broadcast task deletion to all connected clients
  broadcast({
    type: "task:deleted",
    payload: { id },
  });

  return c.json({ message: "Task deleted successfully" });
});
