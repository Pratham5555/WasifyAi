import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Shadows } from '../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
  color?: string;
}

export default function StatCard({ label, value, emoji, color = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, Shadows.sm]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});
