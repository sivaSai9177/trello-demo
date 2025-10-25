// Comment validation schemas
import { z } from "zod";

export const commentCreateSchema = z.object({
  taskId: z.number(),
  text: z.string().min(1, "Comment text is required"),
});

export const commentUpdateSchema = z.object({
  text: z.string().min(1).optional(),
});

export const commentIdSchema = z.object({
  id: z.number(),
});

export const commentTaskIdSchema = z.object({
  taskId: z.number(),
});

export const commentUpdateInputSchema = z.object({
  id: z.number(),
  data: commentUpdateSchema,
});

// Inferred types for convenience
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
export type CommentIdInput = z.infer<typeof commentIdSchema>;
export type CommentTaskIdInput = z.infer<typeof commentTaskIdSchema>;
export type CommentUpdateFullInput = z.infer<typeof commentUpdateInputSchema>;
