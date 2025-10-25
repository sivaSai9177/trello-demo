import React, { useState } from 'react';
import { ProjectsList } from '@/components/ProjectsList';
import { ProjectForm } from '@/components/ProjectForm';
import type { Project } from '@your-org/trello-backend-types';

export default function ProjectsScreen() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreatePress = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditPress = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <>
      <ProjectsList
        onCreatePress={handleCreatePress}
        onEditPress={handleEditPress}
      />
      <ProjectForm
        visible={showForm}
        onClose={handleCloseForm}
        editingProject={editingProject}
      />
    </>
  );
}
