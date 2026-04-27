import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  StatusBar, Image, Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme';
import WasteBadge from '../components/WasteBadge';
import Button from '../components/Button';
import { getCategoryInfo, formatConfidence } from '../utils/wasteCategories';
import type { ResultScreenProps } from '../navigation/types';

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { result, imageUri } = route.params;
  const { category, confidence, points_earned, disposal_guide, all_predictions } = result;
  const info = getCategoryInfo(category);

  // Animations
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pointsScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(pointsScale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const top3 = all_predictions.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Image */}
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={styles.imageGradient}
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 80 }}>{info.emoji}</Text>
        </View>
      )}

      <Animated.View
        style={[styles.content, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
      >
        {/* Category result */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <WasteBadge category={category} size="lg" />
            <Animated.View
              style={[styles.pointsBubble, { transform: [{ scale: pointsScale }] }]}
            >
              <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.pointsBubbleInner}>
                <Text style={styles.pointsValue}>+{points_earned}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.categoryName}>{category}</Text>

          {/* Confidence bar */}
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>AI Confidence</Text>
            <Text style={styles.confValue}>{formatConfidence(confidence)}</Text>
          </View>
          <View style={styles.confBarBg}>
            <Animated.View
              style={[
                styles.confBarFill,
                {
                  width: `${Math.round(confidence * 100)}%` as any,
                  backgroundColor: confidence > 0.75 ? Colors.success : Colors.warning,
                },
              ]}
            />
          </View>

          {/* Other predictions */}
          <Text style={styles.altLabel}>Top Predictions</Text>
          {top3.map((pred, i) => (
            <View key={i} style={styles.predRow}>
              <Text style={styles.predCat}>{pred.category}</Text>
              <View style={styles.predBarBg}>
                <View
                  style={[
                    styles.predBarFill,
                    {
                      width: `${Math.round(pred.confidence * 100)}%` as any,
                      opacity: i === 0 ? 1 : 0.5,
                    },
                  ]}
                />
              </View>
              <Text style={styles.predConf}>{formatConfidence(pred.confidence)}</Text>
            </View>
          ))}
        </View>

        {/* Disposal guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>♻️ Disposal Guide</Text>

          <View style={[styles.binRow]}>
            <View style={[styles.binBadge, { backgroundColor: info.color + '22', borderColor: info.color }]}>
              <Text style={styles.binEmoji}>🗑️</Text>
              <Text style={[styles.binColor, { color: info.color }]}>{disposal_guide.bin_color} Bin</Text>
            </View>
            <View style={styles.flagsRow}>
              <View style={[styles.flag, disposal_guide.recyclable ? styles.flagGreen : styles.flagGray]}>
                <Text style={styles.flagText}>{disposal_guide.recyclable ? '✅ Recyclable' : '❌ Not Recyclable'}</Text>
              </View>
              {disposal_guide.hazardous && (
                <View style={[styles.flag, styles.flagRed]}>
                  <Text style={styles.flagText}>⚠️ Hazardous</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.guideMethod}>{disposal_guide.method}</Text>

          <Text style={styles.tipsTitle}>💡 Tips</Text>
          {disposal_guide.tips.map((tip: string, i: number) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Scan Another"
            onPress={() => navigation.goBack()}
            variant="primary"
            fullWidth
            size="lg"
          />
          <Button
            title="View History"
            onPress={() => navigation.navigate('Result', route.params)} // handled by nav reset
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginTop: 12 }}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { height: 260, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  content: { padding: Spacing.md, paddingTop: 8 },
  resultCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pointsBubble: { alignItems: 'center' },
  pointsBubbleInner: { borderRadius: BorderRadius.lg, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  pointsValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textOnPrimary },
  pointsLabel: { fontSize: FontSize.xs, color: Colors.textOnPrimary + 'CC', marginTop: -4 },
  categoryName: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 16 },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  confLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  confValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confBarBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  confBarFill: { height: 8, borderRadius: 4 },
  altLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 8, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1 },
  predRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  predCat: { fontSize: FontSize.xs, color: Colors.textSecondary, width: 80 },
  predBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  predBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  predConf: { fontSize: FontSize.xs, color: Colors.textMuted, width: 36, textAlign: 'right' },
  guideCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  guideTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 16 },
  binRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  binBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  binEmoji: { fontSize: 16 },
  binColor: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  flagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  flag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: BorderRadius.full },
  flagGreen: { backgroundColor: Colors.success + '22' },
  flagGray: { backgroundColor: Colors.textMuted + '22' },
  flagRed: { backgroundColor: Colors.error + '22' },
  flagText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  guideMethod: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22, marginBottom: 16 },
  tipsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 10 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { color: Colors.primary, fontSize: FontSize.base, marginTop: 2 },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  actions: { paddingBottom: 48 },
});
