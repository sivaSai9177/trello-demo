import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useProjectsRPC,
  useDeleteProjectRPC,
} from '@/hooks/useProjectsRPC';
import { ConnectionStatus } from './ConnectionStatus';
import { GradientBackground } from './ui/GradientBackground';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassColors } from '@/constants/Colors';
import type { Project } from '@your-org/trello-backend-types';

interface ProjectsListProps {
  onProjectPress?: (project: Project) => void;
  onCreatePress?: () => void;
  onEditPress?: (project: Project) => void;
}

export function ProjectsList({
  onProjectPress,
  onCreatePress,
  onEditPress,
}: ProjectsListProps) {
  const { data: projects = [], error, refetch, isRefetching } = useProjectsRPC();
  const deleteProject = useDeleteProjectRPC();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProject.mutateAsync({ id });
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <GlassCard>
            <Text style={styles.errorText}>Error loading projects</Text>
            <GlassButton onPress={() => refetch()} style={styles.retryButton}>
              Retry
            </GlassButton>
          </GlassCard>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ConnectionStatus />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: Math.max(insets.top, 16) + 60, // Safe area + ConnectionStatus height
            paddingBottom: Math.max(insets.bottom, 24) + 100, // Safe area + tab bar + FAB space
          }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={GlassColors.text.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </Text>
        </View>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <MaterialIcons
              name="folder-open"
              size={64}
              color={GlassColors.text.tertiary}
            />
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first project
            </Text>
          </GlassCard>
        ) : (
          <View style={styles.projectsGrid}>
            {projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => onProjectPress?.(project)}
              >
                <GlassCard style={styles.projectCard}>
                  {/* Project Content */}
                  <View style={styles.projectContent}>
                    <Text style={styles.projectName} numberOfLines={2}>
                      {project.name}
                    </Text>
                    {project.description && (
                      <Text style={styles.projectDescription} numberOfLines={3}>
                        {project.description}
                      </Text>
                    )}
                    <Text style={styles.projectDate}>
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        onEditPress?.(project);
                      }}
                      style={styles.actionButton}
                    >
                      <MaterialIcons
                        name="edit"
                        size={20}
                        color={GlassColors.accent.blue}
                      />
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      disabled={deletingId === project.id}
                      style={styles.actionButton}
                    >
                      <MaterialIcons
                        name="delete"
                        size={20}
                        color={
                          deletingId === project.id
                            ? GlassColors.text.tertiary
                            : GlassColors.accent.red
                        }
                      />
                    </Pressable>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {onCreatePress && (
        <Pressable
          onPress={onCreatePress}
          style={[
            styles.fabContainer,
            {
              bottom: Math.max(insets.bottom, 24) + 60, // Safe area + tab bar height
            }
          ]}
        >
          <GlassCard
            style={styles.fab}
            contentStyle={styles.fabContent}
            intensity={40}
          >
            <MaterialIcons
              name="add"
              size={32}
              color={GlassColors.text.primary}
            />
          </GlassCard>
        </Pressable>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    // paddingTop and paddingBottom are set dynamically based on safe area insets
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: GlassColors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: GlassColors.text.secondary,
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    marginBottom: 16,
  },
  projectContent: {
    marginBottom: 16,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: GlassColors.text.primary,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: GlassColors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  projectDate: {
    fontSize: 12,
    color: GlassColors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: GlassColors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: GlassColors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: GlassColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContent: {
    padding: 0, // Remove GlassCard's default padding to center the icon
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
