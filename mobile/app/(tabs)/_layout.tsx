import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassColors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Platform.OS === 'android' ? '#FFFFFF' : GlassColors.accent.blue,
        tabBarInactiveTintColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.6)' : GlassColors.text.tertiary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'android' ? 'transparent' : 'transparent',
          borderTopWidth: 0,
          elevation: Platform.OS === 'android' ? 0 : 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'android' ? (
            // Android: Solid gradient background
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={['rgba(100, 126, 234, 0.98)' as any, 'rgba(118, 75, 162, 0.98)' as any]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { elevation: 8 }]}
              />
            </View>
          ) : (
            // iOS: Glassmorphism with BlurView
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
