import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors } from '@/constants/Colors';

interface GlassButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

export function GlassButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  className,
}: GlassButtonProps) {

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return ['rgba(244, 67, 54, 0.3)', 'rgba(244, 67, 54, 0.1)'];
      case 'secondary':
        return [GlassColors.glass.medium, GlassColors.glass.dark];
      default:
        return [GlassColors.glass.light, GlassColors.glass.dark];
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
      className={className}
    >
      <BlurView intensity={25} tint="light" style={styles.blurView}>
        <LinearGradient
          colors={getVariantColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {typeof children === 'string' ? (
            <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </LinearGradient>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
  },
  blurView: {
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: GlassColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: GlassColors.text.tertiary,
  },
});
