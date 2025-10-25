// Re-export shared types for oRPC
// Types are automatically inferred from the database schema via @trello-demo/shared
export type { Project, Task, Comment, User } from "@trello-demo/shared";

// Export router type for type-safe client generation
export type { AppRouter } from "./index";
