// Re-export types for oRPC - types are now in ../types.ts
// Types are automatically inferred from the database schema
export type { Project, Task, Comment, User } from "../types";

// Export router type for type-safe client generation
export type { AppRouter } from "./index";
