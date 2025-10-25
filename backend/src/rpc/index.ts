// Main RPC Router - Export all procedures
import { createContext } from "./context";
import { projectsRouter } from "./procedures/projects";
import { tasksRouter } from "./procedures/tasks";
import { commentsRouter } from "./procedures/comments";

// Combine all routers - plain object is valid for oRPC
export const appRouter = {
  projects: projectsRouter,
  tasks: tasksRouter,
  comments: commentsRouter,
} as const;

// Export context creator
export { createContext };

// Export router type for frontend
export type AppRouter = typeof appRouter;
