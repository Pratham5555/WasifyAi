import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme';
import { leaderboardApi } from '../services/api';
import type { LeaderboardEntry } from '../types';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await leaderboardApi.get(50);
      setEntries(data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isTop3 = item.rank <= 3;
    const rankColor = isTop3 ? RANK_COLORS[item.rank - 1] : Colors.textMuted;

    return (
      <View
        style={[
          styles.row,
          item.is_current_user && styles.myRow,
          isTop3 && styles.topRow,
        ]}
      >
        <View style={styles.rankBox}>
          {isTop3 ? (
            <Text style={styles.rankEmoji}>{RANK_EMOJIS[item.rank - 1]}</Text>
          ) : (
            <Text style={[styles.rankNum, { color: rankColor }]}>#{item.rank}</Text>
          )}
        </View>

        <View style={[styles.avatar, { backgroundColor: rankColor + '22', borderColor: rankColor }]}>
          <Text style={[styles.avatarText, { color: rankColor }]}>
            {item.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nameBox}>
          <Text style={styles.name} numberOfLines={1}>
            {item.full_name}
            {item.is_current_user && (
              <Text style={styles.youTag}> (You)</Text>
            )}
          </Text>
          <Text style={styles.scans}>{item.scan_count} scans</Text>
        </View>

        <View style={styles.pointsBox}>
          <Text style={[styles.points, { color: isTop3 ? rankColor : Colors.primary }]}>
            {item.total_points.toLocaleString()}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  const myRank = entries.find((e) => e.is_current_user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.user_id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <LinearGradient
              colors={['#1A2E1A', Colors.background]}
              style={styles.headerGradient}
            >
              <Text style={styles.title}>🏆 Leaderboard</Text>
              <Text style={styles.subtitle}>Top eco warriors this season</Text>

              {myRank && (
                <View style={styles.myRankCard}>
                  <Text style={styles.myRankLabel}>Your Rank</Text>
                  <Text style={styles.myRankValue}>#{myRank.rank}</Text>
                  <Text style={styles.myRankPoints}>{myRank.total_points.toLocaleString()} points</Text>
                </View>
              )}
            </LinearGradient>

            <Text style={styles.listTitle}>All Players</Text>
          </>
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyText}>No data yet. Be the first!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, marginTop: 12 },
  headerGradient: { padding: Spacing.md, paddingTop: 52, paddingBottom: 24 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  myRankCard: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
  },
  myRankLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  myRankValue: { fontSize: FontSize.display, fontWeight: FontWeight.extrabold, color: Colors.primary },
  myRankPoints: { fontSize: FontSize.sm, color: Colors.textSecondary },
  listTitle: { fontSize: FontSize.sm, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginHorizontal: Spacing.md, marginBottom: 8 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  myRow: { borderColor: Colors.primary, backgroundColor: Colors.primary + '0D' },
  topRow: { borderWidth: 1.5 },
  rankBox: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 24 },
  rankNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginHorizontal: 12,
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  nameBox: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  youTag: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.regular },
  scans: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  pointsBox: { alignItems: 'flex-end' },
  points: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  pointsLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
