import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  StatusBar, Alert, Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme';
import Button from '../components/Button';
import { userApi, rewardApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Reward, User } from '../types';
import { getStreakMessage } from '../utils/wasteCategories';

export default function ProfileScreen() {
  const { user: storedUser, setUser, logout } = useAuthStore();
  const [user, setLocalUser] = useState<User | null>(storedUser);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [userRes, rewardRes, claimedRes] = await Promise.all([
        userApi.getMe(),
        rewardApi.list(),
        rewardApi.getClaimed(),
      ]);
      setLocalUser(userRes.data);
      setUser(userRes.data);
      setRewards(rewardRes.data);
      setClaimedIds(claimedRes.data.map((r: any) => r.reward_id));
    } catch {}
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleClaim = async (reward: Reward) => {
    if ((user?.total_points ?? 0) < reward.cost_points) {
      Alert.alert('Not enough points', `You need ${reward.cost_points} pts. You have ${user?.total_points ?? 0} pts.`);
      return;
    }
    setClaimingId(reward.id);
    try {
      const { data } = await rewardApi.claim(reward.id);
      Alert.alert('🎉 Reward Claimed!', data.message);
      await load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Could not claim reward');
    } finally {
      setClaimingId(null);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const ICON_MAP: Record<string, string> = {
    shield: '🛡️', trophy: '🏆', earth: '🌍', recycle: '♻️',
    star: '⭐', flame: '🔥', users: '👥', leaf: '🍃', gift: '🎁',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Profile header */}
      <LinearGradient colors={['#0D2515', Colors.background]} style={styles.profileHeader}>
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(user?.full_name || 'U').charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>{getStreakMessage(user?.streak_days ?? 0)}</Text>
        </View>
      </LinearGradient>

      {/* Points overview */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsItem}>
          <Text style={styles.pointsValue}>{user?.total_points ?? 0}</Text>
          <Text style={styles.pointsLabel}>Total Points</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.pointsItem}>
          <Text style={styles.pointsValue}>{user?.scan_count ?? 0}</Text>
          <Text style={styles.pointsLabel}>Total Scans</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.pointsItem}>
          <Text style={styles.pointsValue}>{user?.streak_days ?? 0}</Text>
          <Text style={styles.pointsLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Rewards section */}
      <Text style={styles.sectionTitle}>🎁 Rewards Store</Text>
      <Text style={styles.sectionSub}>
        You have <Text style={styles.highlight}>{user?.total_points ?? 0} pts</Text> available
      </Text>

      {rewards.map((reward) => {
        const isClaimed = claimedIds.includes(reward.id);
        const canAfford = (user?.total_points ?? 0) >= reward.cost_points;
        return (
          <View
            key={reward.id}
            style={[styles.rewardCard, isClaimed && styles.rewardClaimed]}
          >
            <View style={styles.rewardLeft}>
              <Text style={styles.rewardIcon}>{ICON_MAP[reward.icon] ?? '🎁'}</Text>
            </View>
            <View style={styles.rewardMiddle}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardDesc} numberOfLines={2}>{reward.description}</Text>
              <Text style={[styles.rewardCost, !canAfford && !isClaimed && styles.costInsufficient]}>
                {reward.cost_points} pts
              </Text>
            </View>
            <View style={styles.rewardRight}>
              {isClaimed ? (
                <View style={styles.claimedBadge}>
                  <Text style={styles.claimedText}>✓ Claimed</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.claimBtn, (!canAfford || claimingId === reward.id) && styles.claimBtnDisabled]}
                  onPress={() => handleClaim(reward)}
                  disabled={!canAfford || claimingId !== null}
                >
                  <Text style={styles.claimBtnText}>
                    {claimingId === reward.id ? '...' : 'Claim'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}

      {/* Sign out */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="outline"
        fullWidth
        style={styles.logoutBtn}
      />

      <Text style={styles.version}>Wasify AI v1.0.0 • Made with 💚 for the planet</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  profileHeader: { alignItems: 'center', paddingTop: 52, paddingBottom: 32, paddingHorizontal: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 12 },
  streakBadge: {
    backgroundColor: Colors.primary + '20', paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  streakText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  pointsCard: {
    flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  pointsItem: { flex: 1, alignItems: 'center' },
  pointsValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  pointsLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginHorizontal: Spacing.md, marginBottom: 4 },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginHorizontal: Spacing.md, marginBottom: 16 },
  highlight: { color: Colors.primary, fontWeight: FontWeight.bold },
  rewardCard: {
    backgroundColor: Colors.card, marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg,
    padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  rewardClaimed: { opacity: 0.6 },
  rewardLeft: { width: 48, alignItems: 'center' },
  rewardIcon: { fontSize: 32 },
  rewardMiddle: { flex: 1, paddingHorizontal: 12 },
  rewardName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  rewardDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginBottom: 6 },
  rewardCost: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  costInsufficient: { color: Colors.error },
  rewardRight: { alignItems: 'center' },
  claimedBadge: {
    backgroundColor: Colors.success + '22', paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.success + '40',
  },
  claimedText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  claimBtn: {
    backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
  claimBtnDisabled: { backgroundColor: Colors.textMuted },
  claimBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  logoutBtn: { marginHorizontal: Spacing.md, marginTop: 24, marginBottom: 16 },
  version: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});
