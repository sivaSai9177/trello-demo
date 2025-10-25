import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors } from '@/constants/Colors';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  className?: string;
}

export function GlassCard({
  children,
  intensity = 30,
  style,
  contentStyle,
  className,
}: GlassCardProps) {
  // Android: Use solid gradient design (BlurView doesn't work well on Android)
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.androidContainer, style]} className={className}>
        <LinearGradient
          colors={['rgba(100, 126, 234, 0.95)' as any, 'rgba(118, 75, 162, 0.95)' as any]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </LinearGradient>
      </View>
    );
  }

  // iOS: Use glassmorphism with BlurView
  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[styles.blurContainer, style]}
      className={className}
    >
      <LinearGradient
        colors={[GlassColors.glass.light, GlassColors.glass.dark] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </LinearGradient>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
  },
  androidContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
    flex: 1,
  },
});
