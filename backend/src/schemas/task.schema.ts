// Task validation schemas
import { z } from "zod";

export const taskCreateSchema = z.object({
  projectId: z.number(),
  title: z.string().min(1, "Title is required"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigneeId: z.number().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const taskIdSchema = z.object({
  id: z.number(),
});

export const taskUpdateInputSchema = z.object({
  id: z.number(),
  data: taskUpdateSchema,
});

// Inferred types for convenience
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type TaskUpdateFullInput = z.infer<typeof taskUpdateInputSchema>;
