// components/ProjectsList.tsx
import {
  useProjectsRPC,
  useCreateProjectRPC,
  useDeleteProjectRPC,
} from "../hooks/useProjectsRPC";
import { ConnectionStatus } from "./ConnectionStatus";
import { useState } from "react";
import type { Project } from "@trello-demo/shared";

interface ProjectsListProps {
  initialProjects?: Project[];
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  // Use TanStack Query - it will use the loader's prefetched data from cache
  const { data: projects, error } = useProjectsRPC();
  const createProject = useCreateProjectRPC();
  const deleteProject = useDeleteProjectRPC();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({ name, description });
    setName("");
    setDescription("");
  };

  // Use loader data as fallback if query is still loading
  const displayProjects = projects ?? initialProjects ?? [];

  console.log("ProjectsList render - projects:", displayProjects?.[0]?.name);

  if (error)
    return <div className="p-4 text-red-500">Error loading projects</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <ConnectionStatus  />
      <h1 className="text-3xl font-bold mb-6 text-white">Projects</h1>

      {/* Create Project Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Create New Project
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full px-4 py-2 border rounded text-white"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 border rounded text-white"
            rows={3}
          />
          <button
            type="submit"
            disabled={createProject.isPending}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>

      {/* Projects List */}
      <div className="space-y-4">
        {displayProjects.length === 0 ? (
          <p className="text-gray-500">No projects yet</p>
        ) : (
          displayProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-amber-100">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteProject.mutate({ id: project.id })}
                  disabled={deleteProject.isPending}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
