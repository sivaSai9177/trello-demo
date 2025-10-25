// Projects RPC Procedures
import { os } from "@orpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import * as tables from "../../db/schema";
import type { Context } from "../context";

// Validation schemas
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const projectIdSchema = z.object({
  id: z.number(),
});

// Create base procedure with context
const baseProcedure = os.$context<Context>();

export const projectsRouter = {
  // Get all projects
  getAll: baseProcedure.handler(async ({ context }) => {
    const projects = await context.db
      .select()
      .from(tables.projectsTable)
      .orderBy(desc(tables.projectsTable.updatedAt));

    return projects;
  }),

  // Get project by ID
  getById: baseProcedure
    .input(projectIdSchema)
    .handler(async ({ input, context }) => {
      const [project] = await context.db
        .select()
        .from(tables.projectsTable)
        .where(eq(tables.projectsTable.id, input.id));

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }),

  // Create project
  create: baseProcedure
    .input(projectSchema)
    .handler(async ({ input, context }) => {
      const [newProject] = await context.db
        .insert(tables.projectsTable)
        .values(input)
        .returning();

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "project:created",
        payload: newProject,
      });

      return newProject;
    }),

  // Update project
  update: baseProcedure
    .input(
      z.object({
        id: z.number(),
        data: projectSchema,
      })
    )
    .handler(async ({ input, context }) => {
      const [updated] = await context.db
        .update(tables.projectsTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(tables.projectsTable.id, input.id))
        .returning();

      if (!updated) {
        throw new Error("Project not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "project:updated",
        payload: updated,
      });

      return updated;
    }),

  // Delete project
  delete: baseProcedure
    .input(projectIdSchema)
    .handler(async ({ input, context }) => {
      const [deleted] = await context.db
        .delete(tables.projectsTable)
        .where(eq(tables.projectsTable.id, input.id))
        .returning();

      if (!deleted) {
        throw new Error("Project not found");
      }

      // Broadcast to WebSocket clients
      context.broadcast({
        type: "project:deleted",
        payload: { id: input.id },
      });

      return deleted;
    }),
};
