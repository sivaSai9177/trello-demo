// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProjectDto {
  name: string;
  description?: string;
}

const API_URL = "http://localhost:3002";

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data } = await axios.get(`${API_URL}/projects`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    // No polling needed! PostgreSQL LISTEN/NOTIFY + WebSocket handles all real-time updates
    // including changes from Drizzle Studio, direct SQL, or any other source
    refetchOnWindowFocus: true, // Still refetch on window focus for better UX
    placeholderData: keepPreviousData
  });
}

// Fetch single project
export function useProject(id: number) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async (): Promise<Project> => {
      const { data } = await axios.get(`${API_URL}/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: CreateProjectDto): Promise<Project> => {
      const { data } = await axios.post(`${API_URL}/projects`, newProject);
      return data;
    },
    onSuccess: () => {
      // WebSocket will handle cache update, but invalidate as backup
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: CreateProjectDto;
    }): Promise<Project> => {
      const { data } = await axios.put(`${API_URL}/projects/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      // WebSocket will handle cache update
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await axios.delete(`${API_URL}/projects/${id}`);
    },
    onSuccess: () => {
      // WebSocket will handle cache update
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
