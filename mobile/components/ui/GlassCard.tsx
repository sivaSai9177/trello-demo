import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle } from 'react-native';
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
  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[styles.blurContainer, style]}
      className={className}
    >
      <LinearGradient
        colors={[GlassColors.glass.light, GlassColors.glass.dark]}
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
