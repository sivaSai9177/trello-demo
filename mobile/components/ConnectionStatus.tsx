import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@tanstack/react-store';
import { websocketStore } from '@/stores/websocket.store';
import { GlassColors } from '@/constants/Colors';

export function ConnectionStatus() {
  const { connectionStatus } = useStore(websocketStore);
  const isConnected = connectionStatus === 'connected';

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return GlassColors.status.online;
      case 'disconnected':
      case 'error':
        return GlassColors.status.offline;
      default:
        return GlassColors.glass.medium;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline - Using cached data';
      case 'error':
        return 'Connection error';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint={isConnected ? 'light' : 'dark'} style={styles.blur}>
        <LinearGradient
          colors={[getStatusColor(), 'rgba(0,0,0,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isConnected
                    ? GlassColors.accent.green
                    : GlassColors.accent.red,
                },
              ]}
            />
            <Text style={styles.text}>{getStatusText()}</Text>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blur: {
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 50, // Account for status bar
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: GlassColors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
