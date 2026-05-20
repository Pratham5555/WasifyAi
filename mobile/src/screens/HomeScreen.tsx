import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  StatusBar, Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadows } from '../theme';
import StatCard from '../components/StatCard';
import WasteBadge from '../components/WasteBadge';
import { userApi, detectionApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Detection, User } from '../types';
import { formatConfidence, getStreakMessage } from '../utils/wasteCategories';
import { format } from 'date-fns';

export default function HomeScreen() {
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [user, setLocalUser] = useState<User | null>(storedUser);
  const [recentScans, setRecentScans] = useState<Detection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userRes, detRes] = await Promise.all([
        userApi.getMe(),
        detectionApi.list(5),
      ]);
      setLocalUser(userRes.data);
      setUser(userRes.data);
      setRecentScans(detRes.data);
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const firstName = user?.full_name?.split(' ')[0] || 'Eco Hero';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Let's scan some waste today!</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* Points Hero Card */}
      <LinearGradient
        colors={['#00E676', '#00BFA5', '#1DE9B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>ECO POINTS</Text>
          <Text style={styles.heroPoints}>{user?.total_points ?? 0}</Text>
          <Text style={styles.heroStreak}>{getStreakMessage(user?.streak_days ?? 0)}</Text>
        </View>
        <View style={styles.heroRight}>
          <Text style={styles.heroBigEmoji}>🌍</Text>
        </View>
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="Total Scans" value={user?.scan_count ?? 0} emoji="📷" color={Colors.primary} />
        <StatCard label="Day Streak" value={user?.streak_days ?? 0} emoji="🔥" color={Colors.warning} />
        <StatCard label="Points" value={user?.total_points ?? 0} emoji="⭐" color={Colors.secondary} />
      </View>

      {/* Recent scans */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <Text style={styles.sectionSub}>Pull down to refresh</Text>
      </View>

      {recentScans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📷</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySub}>Tap the camera button to scan your first waste item!</Text>
        </View>
      ) : (
        recentScans.map((scan) => (
          <View key={scan.id} style={styles.scanCard}>
            <View style={styles.scanLeft}>
              <WasteBadge category={scan.category} size="md" />
              <Text style={styles.scanTime}>
                {format(new Date(scan.created_at), 'MMM d, h:mm a')}
              </Text>
            </View>
            <View style={styles.scanRight}>
              <Text style={styles.scanPoints}>+{scan.points_earned} pts</Text>
              <Text style={styles.scanConf}>{formatConfidence(scan.confidence)} confidence</Text>
            </View>
          </View>
        ))
      )}

      {/* Tips section */}
      <View style={[styles.tipsCard, Shadows.sm]}>
        <Text style={styles.tipsTitle}>💡 Did you know?</Text>
        <Text style={styles.tipsText}>
          Recycling one aluminum can saves enough energy to run a TV for 3 hours. Every scan you make is a step toward a greener world!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 52, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subGreeting: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 130,
  },
  heroLeft: { flex: 1, zIndex: 1 },
  heroLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textOnPrimary + 'CC', letterSpacing: 2 },
  heroPoints: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.textOnPrimary, lineHeight: 56 },
  heroStreak: { fontSize: FontSize.sm, color: Colors.textOnPrimary + 'CC', marginTop: 4 },
  heroRight: { justifyContent: 'center', zIndex: 1 },
  heroBigEmoji: { fontSize: 56 },
  heroCircle1: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)', right: 80, top: -30,
  },
  heroCircle2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)', right: 20, bottom: -20,
  },
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sectionSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: 32, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed', marginBottom: 16,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  scanCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: 16, marginBottom: 8, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  scanLeft: { gap: 8 },
  scanTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  scanRight: { alignItems: 'flex-end' },
  scanPoints: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  scanConf: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  tipsCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: 20, marginTop: 8,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  tipsTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  tipsText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
