import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme';
import Button from '../components/Button';
import { authApi, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { LoginScreenProps } from '../navigation/types';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      shake();
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login(email.trim().toLowerCase(), password);
      setTokens(data.access_token, data.refresh_token);
      const userResp = await userApi.getMe();
      setUser(userResp.data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Login failed');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

        {/* Header glow */}
        <View style={styles.headerGlow} />

        {/* Logo */}
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.logoCircle}
          >
            <Text style={{ fontSize: 28 }}>♻️</Text>
          </LinearGradient>
          <View>
            <Text style={styles.appName}>Wasify AI</Text>
            <Text style={styles.appSub}>Smart waste classifier</Text>
          </View>
        </View>

        <Text style={styles.heading}>Welcome back 👋</Text>
        <Text style={styles.subheading}>Sign in to continue saving the planet</Text>

        {/* Form card */}
        <Animated.View
          style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}
        >
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable style={styles.showBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtnText}>{showPass ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 24 }}
          />
        </Animated.View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.replace('Register')}>
            <Text style={styles.footerLink}>Create one →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: Colors.primary,
    opacity: 0.04,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  appSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  heading: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    backgroundColor: Colors.error + '22',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  showBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  showBtnText: {
    fontSize: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
