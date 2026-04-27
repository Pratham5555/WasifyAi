import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { Colors, FontSize } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message = 'Analyzing...' }: LoadingOverlayProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.emoji}>🔍</Text>
          <ActivityIndicator color={Colors.primary} size="large" style={styles.spinner} />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.sub}>AI is classifying your waste</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 240,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});
