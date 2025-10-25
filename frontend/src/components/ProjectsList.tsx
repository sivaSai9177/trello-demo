// components/ProjectsList.tsx
import {
  useProjectsRPC,
  useCreateProjectRPC,
  useDeleteProjectRPC,
  useUpdateProjectRPC,
} from "../hooks/useProjectsRPC";
import { ConnectionStatus } from "./ConnectionStatus";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { Project } from "@your-org/trello-backend-types";
import { z } from "zod";

interface ProjectsListProps {
  initialProjects?: Project[];
}

export function ProjectsList({ initialProjects = [] }: ProjectsListProps = {}) {
  // Use TanStack Query - it will use the loader's prefetched data from cache
  const { data: projects, error } = useProjectsRPC();
  const createProject = useCreateProjectRPC();
  const deleteProject = useDeleteProjectRPC();
  const updateProject = useUpdateProjectRPC();

  const [editingId, setEditingId] = useState<number | null>(null);

  // TanStack Form with Zod validation
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (editingId) {
        // Update existing project
        await updateProject.mutateAsync({
          id: editingId,
          data: value,
        });
        setEditingId(null);
      } else {
        // Create new project
        await createProject.mutateAsync(value);
      }
      // Reset form
      form.reset();
    },
  });

  const handleEditClick = (project: Project) => {
    setEditingId(project.id);
    form.setFieldValue("name", project.name);
    form.setFieldValue("description", project.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
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

      {/* Create/Edit Project Form with TanStack Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mb-8 p-4 border rounded-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-white">
          {editingId ? "Edit Project" : "Create New Project"}
        </h2>
        <div className="space-y-4">
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = z.string().min(1, "Name is required").safeParse(value);
                return result.success ? undefined : result.error.errors[0].message;
              },
            }}
            children={(field) => (
              <div>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Project name"
                  className="w-full px-4 py-2 border rounded text-white bg-gray-800"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          {/* Description Field */}
          <form.Field
            name="description"
            children={(field) => (
              <div>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 border rounded text-white bg-gray-800"
                  rows={3}
                />
              </div>
            )}
          />

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {editingId
                    ? isSubmitting
                      ? "Saving..."
                      : "Save Changes"
                    : isSubmitting
                    ? "Creating..."
                    : "Create Project"}
                </button>
              )}
            />
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
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
              className={`p-4 border rounded-lg hover:shadow-md transition group ${
                editingId === project.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-amber-100">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(project)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject.mutate({ id: project.id })}
                    disabled={deleteProject.isPending}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
