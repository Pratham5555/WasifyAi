import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Pressable,
  StatusBar, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme';
import Button from '../components/Button';
import { authApi, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { RegisterScreenProps } from '../navigation/types';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const emailRef = useRef<TextInput>(null);
  const passRef = useRef<TextInput>(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      shake();
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      shake();
      return;
    }

    setLoading(true);
    try {
      await authApi.register(email.trim().toLowerCase(), password, name.trim());
      const { data: loginData } = await authApi.login(email.trim().toLowerCase(), password);
      setTokens(loginData.access_token, loginData.refresh_token);
      const userResp = await userApi.getMe();
      setUser(userResp.data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed.';
      setError(typeof msg === 'string' ? msg : 'Registration failed');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.logoCircle}>
          <Text style={{ fontSize: 28 }}>♻️</Text>
        </LinearGradient>

        <Text style={styles.heading}>Join Wasify AI 🌱</Text>
        <Text style={styles.subheading}>Create an account and start your eco journey</Text>

        <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passRef}
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <Pressable style={styles.showBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={{ fontSize: 20 }}>{showPass ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <Text style={styles.passwordHint}>
            {'✓ '} At least 6 characters · Mix of letters & numbers recommended
          </Text>

          <Button
            title="Create Account 🚀"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 24 }}
          />
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 60 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  heading: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 8 },
  subheading: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 32 },
  formCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  errorBox: { backgroundColor: Colors.error + '22', borderRadius: BorderRadius.md, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: Colors.error },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 14, fontSize: FontSize.base, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  passwordRow: { position: 'relative' },
  showBtn: { position: 'absolute', right: 12, top: 12, padding: 4 },
  passwordHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.md },
  footerLink: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
