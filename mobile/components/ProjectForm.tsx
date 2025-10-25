import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreateProjectRPC, useUpdateProjectRPC } from '@/hooks/useProjectsRPC';
import { GlassModal } from './ui/GlassModal';
import { GlassButton } from './ui/GlassButton';
import { GlassColors } from '@/constants/Colors';
import type { Project } from '@your-org/trello-backend-types';

interface ProjectFormProps {
  visible: boolean;
  onClose: () => void;
  editingProject?: Project | null;
}

export function ProjectForm({ visible, onClose, editingProject }: ProjectFormProps) {
  const createProject = useCreateProjectRPC();
  const updateProject = useUpdateProjectRPC();

  // TanStack Form with Zod validation (same as web)
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingProject) {
          // Update existing project
          await updateProject.mutateAsync({
            id: editingProject.id,
            data: value,
          });
        } else {
          // Create new project
          await createProject.mutateAsync(value);
        }
        // Reset form and close modal
        form.reset();
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingProject) {
      form.setFieldValue('name', editingProject.name);
      form.setFieldValue('description', editingProject.description || '');
    } else {
      form.reset();
    }
  }, [editingProject]);

  const isSubmitting = createProject.isPending || updateProject.isPending;

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <BlurView intensity={40} tint="light" style={styles.container}>
        <LinearGradient
          colors={[GlassColors.glass.light, GlassColors.glass.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </Text>

            {/* Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = z.string().min(1, 'Name is required').safeParse(value);
                  return result.success ? undefined : result.error.errors[0].message;
                },
              }}
              children={(field) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Project Name *</Text>
                  <TextInput
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    onBlur={field.handleBlur}
                    placeholder="Enter project name"
                    placeholderTextColor={GlassColors.text.tertiary}
                    style={styles.input}
                    autoFocus={!editingProject}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Text style={styles.errorText}>
                      {field.state.meta.errors[0]}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Description Field */}
            <form.Field
              name="description"
              children={(field) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Description (optional)</Text>
                  <TextInput
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    onBlur={field.handleBlur}
                    placeholder="Enter description"
                    placeholderTextColor={GlassColors.text.tertiary}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit]) => (
                  <GlassButton
                    onPress={() => form.handleSubmit()}
                    disabled={!canSubmit || isSubmitting}
                    style={styles.submitButton}
                  >
                    {editingProject
                      ? isSubmitting
                        ? 'Saving...'
                        : 'Save Changes'
                      : isSubmitting
                      ? 'Creating...'
                      : 'Create Project'}
                  </GlassButton>
                )}
              />
              <GlassButton
                onPress={onClose}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </GlassButton>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GlassColors.text.primary,
    marginBottom: 8,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: GlassColors.text.secondary,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: GlassColors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: GlassColors.accent.red,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
  },
});
