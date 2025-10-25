// Project validation schemas
import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const projectIdSchema = z.object({
  id: z.number(),
});

export const projectUpdateSchema = z.object({
  id: z.number(),
  data: projectSchema,
});

// Inferred types for convenience
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectIdInput = z.infer<typeof projectIdSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
