import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassColors } from '@/constants/Colors';

export default function TasksScreen() {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <GlassCard style={styles.card}>
          <MaterialIcons
            name="construction"
            size={64}
            color={GlassColors.text.secondary}
          />
          <Text style={styles.title}>Tasks Coming Soon</Text>
          <Text style={styles.subtitle}>
            Task management will be available in the next update
          </Text>
        </GlassCard>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GlassColors.text.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: GlassColors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
