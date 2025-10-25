import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { BlurView } from 'expo-blur';
import { GlassColors } from '@/constants/Colors';
import { getCachedProjects } from '@/lib/storage';

export default function OfflineScreen() {
  const { isOnline } = useNetworkStatus();
  const router = useRouter();
  const [cachedProjectsCount, setCachedProjectsCount] = useState(0);

  useEffect(() => {
    // Load cached projects count
    getCachedProjects().then(projects => {
      setCachedProjectsCount(projects.length);
    });
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Auto-redirect when online
      router.replace('/');
    }
  }, [isOnline]);

  const checkConnection = async () => {
    // Force a network check
    if (isOnline) {
      router.replace('/');
    }
  };

  return (
    <GradientBackground
      colors={[GlassColors.background.gradient1, GlassColors.background.gradient2]}
    >
      <BlurView intensity={50} style={styles.container}>
        <View style={styles.content}>
          {/* WiFi Off Icon */}
          <MaterialIcons name="wifi-off" size={120} color={GlassColors.text.primary} />

          {/* Title */}
          <Text style={styles.title}>You're Offline</Text>

          {/* Description */}
          <Text style={styles.description}>
            Check your internet connection and try again
          </Text>

          {/* Cached Data Info */}
          <GlassCard style={styles.cacheCard}>
            <View style={styles.cacheContent}>
              <MaterialIcons
                name="folder"
                size={24}
                color={GlassColors.text.secondary}
              />
              <Text style={styles.cacheText}>
                {cachedProjectsCount} projects available offline
              </Text>
            </View>
          </GlassCard>

          {/* Retry Button */}
          <GlassButton
            onPress={checkConnection}
            style={styles.retryButton}
          >
            Retry Connection
          </GlassButton>
        </View>
      </BlurView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: GlassColors.text.primary,
    marginTop: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: GlassColors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  cacheCard: {
    marginTop: 32,
  },
  cacheContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cacheText: {
    color: GlassColors.text.secondary,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 32,
  },
});
