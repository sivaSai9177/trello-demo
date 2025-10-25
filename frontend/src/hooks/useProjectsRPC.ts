// hooks/useProjectsRPC.ts - Type-safe RPC hooks using oRPC
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "../lib/orpc-client";
import type { Project } from "@your-org/trello-backend-types";

// Fetch all projects with oRPC
export function useProjectsRPC() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      // Skip during SSR (server-side rendering)
      if (typeof window === "undefined") {
        return [];
      }
      return await orpcClient.projects.getAll();
    },
    // Don't run query during SSR
    enabled: typeof window !== "undefined",
  });
}

// Fetch single project with oRPC
export function useProjectRPC(id: number) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: async () => {
      return await orpcClient.projects.getById({ id });
    },
    enabled: !!id,
  });
}

// Create project mutation with oRPC
export function useCreateProjectRPC() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, { name: string; description?: string }>({
    mutationFn: async (input) => {
      return await orpcClient.projects.create(input);
    },
    onSuccess: () => {
      // WebSocket will handle cache update, but invalidate as backup
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update project mutation with oRPC
export function useUpdateProjectRPC() {
  const queryClient = useQueryClient();

  return useMutation<
    Project,
    Error,
    { id: number; data: { name?: string; description?: string } }
  >({
    mutationFn: async (input) => {
      return await orpcClient.projects.update(input);
    },
    onSuccess: () => {
      // WebSocket will handle cache update
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Delete project mutation with oRPC
export function useDeleteProjectRPC() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, { id: number }>({
    mutationFn: async (input) => {
      return await orpcClient.projects.delete(input);
    },
    onSuccess: () => {
      // WebSocket will handle cache update
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
