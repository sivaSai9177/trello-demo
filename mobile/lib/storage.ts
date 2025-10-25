import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project } from '@your-org/trello-backend-types';

// Cache projects for offline access
export async function cacheProjects(projects: Project[]) {
  try {
    await AsyncStorage.setItem('projects', JSON.stringify(projects));
    await AsyncStorage.setItem('projects_cached_at', Date.now().toString());
  } catch (error) {
    console.error('Error caching projects:', error);
  }
}

// Get cached projects
export async function getCachedProjects(): Promise<Project[]> {
  try {
    const cached = await AsyncStorage.getItem('projects');
    if (!cached) return [];
    return JSON.parse(cached);
  } catch (error) {
    console.error('Error getting cached projects:', error);
    return [];
  }
}

// Get cache timestamp
export async function getCacheTimestamp(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem('projects_cached_at');
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    return null;
  }
}

// Clear all cache
export async function clearCache() {
  try {
    await AsyncStorage.removeItem('projects');
    await AsyncStorage.removeItem('projects_cached_at');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Check if cache is stale (older than 5 minutes)
export async function isCacheStale(): Promise<boolean> {
  const timestamp = await getCacheTimestamp();
  if (!timestamp) return true;

  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - timestamp > fiveMinutes;
}
