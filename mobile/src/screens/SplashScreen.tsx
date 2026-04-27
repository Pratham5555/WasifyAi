import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight } from '../theme';
import type { SplashScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const token = useAuthStore((s) => s.token);
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      if (token) {
        // Already logged in → go to main app
        // Navigation is handled by the navigator based on token state
      } else {
        navigation.replace('Onboarding');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.background, '#0D2020', Colors.background]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Decorative glowing circles */}
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle1,
          { transform: [{ scale: circleScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle2,
          { transform: [{ scale: circleScale }] },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.logoCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoEmoji}>♻️</Text>
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>
          <Text style={styles.wasify}>Wasify</Text>
          <Text style={styles.ai}> AI</Text>
        </Text>
        <Text style={styles.tagline}>Smart waste. Greener future.</Text>
      </Animated.View>

      {/* Bottom loading indicator */}
      <Animated.View style={[styles.loadingDots, { opacity: textOpacity }]}>
        <LoadingDots />
      </Animated.View>
    </LinearGradient>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    Animated.parallel([animate(dot1, 0), animate(dot2, 200), animate(dot3, 400)]).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.primary,
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.06,
    backgroundColor: Colors.primary,
  },
  glowCircle1: {
    width: 350,
    height: 350,
    top: height * 0.1,
    left: -100,
  },
  glowCircle2: {
    width: 280,
    height: 280,
    bottom: height * 0.1,
    right: -80,
    backgroundColor: Colors.secondary,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logoEmoji: {
    fontSize: 52,
  },
  appName: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
  },
  wasify: {
    color: Colors.textPrimary,
  },
  ai: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 8,
    letterSpacing: 1,
  },
  loadingDots: {
    position: 'absolute',
    bottom: 60,
  },
});
