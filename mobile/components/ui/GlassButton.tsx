import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  View,
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

  const getVariantColorsAndroid = () => {
    switch (variant) {
      case 'danger':
        return ['rgba(244, 67, 54, 0.9)' as any, 'rgba(211, 47, 47, 0.9)' as any];
      case 'secondary':
        return ['rgba(100, 126, 234, 0.8)' as any, 'rgba(118, 75, 162, 0.8)' as any];
      default:
        return ['rgba(100, 126, 234, 0.9)' as any, 'rgba(118, 75, 162, 0.9)' as any];
    }
  };

  const getVariantColorsIOS = () => {
    switch (variant) {
      case 'danger':
        return ['rgba(244, 67, 54, 0.3)', 'rgba(244, 67, 54, 0.1)'];
      case 'secondary':
        return [GlassColors.glass.medium, GlassColors.glass.dark];
      default:
        return [GlassColors.glass.light, GlassColors.glass.dark];
    }
  };

  // Android: Use solid gradient
  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.androidContainer, style, disabled && styles.disabled]}
        className={className}
      >
        <LinearGradient
          colors={getVariantColorsAndroid()}
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
      </Pressable>
    );
  }

  // iOS: Use glassmorphism with BlurView
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
      className={className}
    >
      <BlurView intensity={25} tint="light" style={styles.blurView}>
        <LinearGradient
          colors={getVariantColorsIOS() as any}
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
  androidContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
