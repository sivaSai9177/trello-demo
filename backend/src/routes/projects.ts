import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as tables from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db";
import { broadcast } from "../ws/manager";

export const projectsRoute = new Hono();

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

projectsRoute.get("/", async (c) => {
  const projects = await db
    .select()
    .from(tables.projectsTable)
    .orderBy(desc(tables.projectsTable.updatedAt));
  return c.json(projects);
});

projectsRoute.post("/", zValidator("json", projectSchema), async (c) => {
  console.log("parsedData", c.req.valid("json"));
  const data = c.req.valid("json");
  const newProject = (
    await db.insert(tables.projectsTable).values(data).returning()
  ).map((r) => ({ ...r }))[0];

  // 🔥 Broadcast new project to all connected clients
  broadcast({
    type: "project:created",
    payload: newProject,
  });
  return c.json(newProject, 201);
});

projectsRoute.put("/:id", zValidator("json", projectSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (!id) return c.json({ error: "Invalid project ID" }, 400);
  const data = c.req.valid("json");
  const updated = await db
    .update(tables.projectsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tables.projectsTable.id, id))
    .returning();

  if (updated.length === 0) return c.json({ error: "Project not found" }, 404);
  console.log("🔥 Broadcasting update:", updated[0]); // ADD THIS

  const updatedProject = { ...updated[0] }; // plain object
  // 🔥 Broadcast updated project
  broadcast({
    type: "project:updated",
    payload: updated[0],
  });
  return c.json(updated[0]);
});

projectsRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  // First, check if the project exists
  const existingProject = await db
    .select()
    .from(tables.projectsTable)
    .where(eq(tables.projectsTable.id, id))
    .limit(1);

  if (existingProject.length === 0) {
    return c.json({ error: "Project not found" }, 404);
  }

  // 🗑️ Delete the project
  await db.delete(tables.projectsTable).where(eq(tables.projectsTable.id, id));

  // 🔥 Broadcast deletion
  broadcast({
    type: "project:deleted",
    payload: { id },
  });
  return c.json(existingProject[0], 201);
});
