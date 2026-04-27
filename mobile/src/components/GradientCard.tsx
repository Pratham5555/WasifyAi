import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Shadows } from '../theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  padding?: number;
}

export default function GradientCard({
  children,
  style,
  colors = [Colors.primary, Colors.secondary],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  padding = 20,
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.gradient, { padding }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
});
