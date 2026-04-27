import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme';
import Button from '../components/Button';
import type { OnboardingScreenProps } from '../navigation/types';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '📷',
    title: 'Scan Any Waste',
    description:
      'Point your camera at any waste item. Our AI instantly identifies it from 12 categories with high accuracy.',
    color: Colors.primary,
    bg: '#0D2B1A',
  },
  {
    id: '2',
    emoji: '♻️',
    title: 'Get Disposal Tips',
    description:
      'Learn exactly how to dispose of each item. Never second-guess which bin to use again.',
    color: Colors.secondary,
    bg: '#0D2525',
  },
  {
    id: '3',
    emoji: '🏆',
    title: 'Earn Eco Points',
    description:
      'Every scan earns you points. Climb the leaderboard, maintain streaks, and unlock rewards.',
    color: Colors.accent,
    bg: '#0D2020',
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Skip button */}
      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide]}>
            {/* Glow background */}
            <View style={[styles.glowBg, { backgroundColor: item.bg }]} />

            {/* Emoji illustration */}
            <LinearGradient
              colors={[item.color + '33', item.color + '11']}
              style={styles.emojiContainer}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </LinearGradient>

            <Text style={[styles.slideTitle, { color: item.color }]}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].color },
              ]}
            />
          );
        })}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title={currentIndex === SLIDES.length - 1 ? "Let's Go! 🚀" : 'Next →'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
        <Pressable style={styles.loginLink} onPress={() => navigation.replace('Login')}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  glowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  emojiContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 80,
  },
  slideTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomButtons: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  loginLinkBold: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
