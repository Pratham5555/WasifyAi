import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme';
import WasteBadge from '../components/WasteBadge';
import { detectionApi } from '../services/api';
import type { Detection } from '../types';
import { formatConfidence } from '../utils/wasteCategories';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadDetections = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    try {
      const { data } = await detectionApi.list(LIMIT, currentOffset);
      if (reset) {
        setDetections(data);
        setOffset(LIMIT);
      } else {
        setDetections((prev) => [...prev, ...data]);
        setOffset((prev) => prev + LIMIT);
      }
      setHasMore(data.length === LIMIT);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset]);

  useEffect(() => { loadDetections(true); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDetections(true);
  };

  const renderItem = ({ item }: { item: Detection }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <WasteBadge category={item.category} size="md" />
        <Text style={styles.source}>
          {item.source === 'on_device' ? '📱 On-Device' : '☁️ API'} •{' '}
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
        <Text style={styles.time}>{format(new Date(item.created_at), 'h:mm a')}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.points}>+{item.points_earned}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
        <View style={styles.confBar}>
          <View
            style={[
              styles.confFill,
              { width: `${Math.round(item.confidence * 100)}%` as any },
            ]}
          />
        </View>
        <Text style={styles.confText}>{formatConfidence(item.confidence)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Scan History 📋</Text>
        <Text style={styles.subtitle}>{detections.length} scans total</Text>
      </View>

      <FlatList
        data={detections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        onEndReached={() => hasMore && loadDetections()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySub}>Tap the camera to start scanning!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, marginTop: 12 },
  header: { padding: Spacing.md, paddingTop: 52, paddingBottom: 8 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  list: { padding: Spacing.md, paddingTop: 8 },
  card: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: 16, marginBottom: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cardLeft: { flex: 1, gap: 6 },
  source: { fontSize: FontSize.xs, color: Colors.textMuted },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  cardRight: { alignItems: 'flex-end', minWidth: 64 },
  points: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  pointsLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: -4 },
  confBar: {
    width: 60, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, marginTop: 8, overflow: 'hidden',
  },
  confFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  confText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
});
