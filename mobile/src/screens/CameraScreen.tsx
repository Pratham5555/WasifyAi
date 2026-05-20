import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar,
  Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme';
import { detectionApi } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';
import type { CameraMainScreenProps } from '../navigation/types';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.75;

export default function CameraScreen({ navigation }: CameraMainScreenProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [analyzing, setAnalyzing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!camera.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await camera.current.takePhoto({
        flash,
        qualityPrioritization: 'balanced',
      });

      setCapturing(false);
      setAnalyzing(true);

      const imageUri = `file://${photo.path}`;
      const { data: result } = await detectionApi.classify(imageUri);

      setAnalyzing(false);
      navigation.navigate('Result', { result, imageUri });
    } catch (err: any) {
      setCapturing(false);
      setAnalyzing(false);
      Alert.alert(
        'Classification Failed',
        err?.response?.data?.detail || 'Could not connect to server. Check that the backend is running.',
        [{ text: 'OK' }]
      );
    }
  }, [capturing, flash, navigation]);

  // Permission not yet requested or denied
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permEmoji}>📷</Text>
        <Text style={styles.permTitle}>Camera Permission Needed</Text>
        <Text style={styles.permSub}>We need camera access to scan waste items</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.permSub}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LoadingOverlay visible={analyzing} message="AI is analyzing..." />

      {/* Camera */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!analyzing}
        photo
      />

      {/* Top controls */}
      <View style={styles.topControls}>
        <Pressable style={styles.controlBtn} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
          <Text style={styles.controlEmoji}>{flash === 'on' ? '⚡' : '🔦'}</Text>
        </Pressable>
        <View style={styles.modeTag}>
          <Text style={styles.modeText}>☁️ API Mode</Text>
        </View>
        <View style={styles.controlBtn} />
      </View>

      {/* Scan frame */}
      <View style={styles.frameWrapper}>
        <View style={styles.frameDarkenTop} />
        <View style={styles.frameRow}>
          <View style={styles.frameDarkenSide} />
          <View style={styles.frame}>
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.frameDarkenSide} />
        </View>
        <View style={styles.frameDarkenBottom} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsText}>
          Point at a waste item and tap the button to classify
        </Text>
      </View>

      {/* Bottom capture controls */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bottomGradient}
      >
        <View style={styles.captureRow}>
          {/* Gallery placeholder */}
          <View style={styles.sideBtn} />

          {/* Main capture button */}
          <Pressable
            style={({ pressed }) => [
              styles.captureBtn,
              (capturing || analyzing) && styles.captureBtnDisabled,
              pressed && { transform: [{ scale: 0.93 }] },
            ]}
            onPress={handleCapture}
            disabled={capturing || analyzing}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.captureBtnInner}
            >
              {capturing ? (
                <ActivityIndicator color={Colors.textOnPrimary} size="large" />
              ) : (
                <Text style={styles.captureEmoji}>📷</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Info side btn */}
          <Pressable
            style={styles.sideBtn}
            onPress={() => Alert.alert(
              'How it works',
              '1. Point camera at waste\n2. Tap capture\n3. AI classifies it\n4. Get disposal tips + earn points!',
            )}
          >
            <Text style={styles.sideBtnText}>ℹ️</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const CORNER = 24;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permEmoji: { fontSize: 64, marginBottom: 16 },
  permTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  permSub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  permBtn: {
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: BorderRadius.md,
  },
  permBtnText: { color: Colors.textOnPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.base },
  topControls: {
    position: 'absolute', top: 48, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, zIndex: 10,
  },
  controlBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  controlEmoji: { fontSize: 20 },
  modeTag: {
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary,
  },
  modeText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  frameWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frameDarkenTop: { position: 'absolute', top: 0, left: 0, right: 0, height: (height - FRAME_SIZE) / 2, backgroundColor: 'rgba(0,0,0,0.55)' },
  frameDarkenBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: (height - FRAME_SIZE) / 2, backgroundColor: 'rgba(0,0,0,0.55)' },
  frameRow: { flexDirection: 'row', width: '100%', height: FRAME_SIZE, alignItems: 'center' },
  frameDarkenSide: { flex: 1, height: FRAME_SIZE, backgroundColor: 'rgba(0,0,0,0.55)' },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.primary, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  instructionsBox: {
    position: 'absolute', bottom: 160, left: 32, right: 32,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BorderRadius.md,
    paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  instructionsText: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center' },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 40 },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 48, paddingTop: 16 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnInner: { flex: 1, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  captureEmoji: { fontSize: 32 },
  sideBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  sideBtnText: { fontSize: 20 },
});
