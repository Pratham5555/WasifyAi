/**
 * Wasify AI - API Service
 *
 * HOW TO FIND YOUR IP ADDRESS (Windows):
 * 1. Open Command Prompt (cmd)
 * 2. Type: ipconfig
 * 3. Look for "IPv4 Address" under your WiFi adapter
 * 4. Replace the BASE_URL below with: http://YOUR_IP:8000
 *
 * For Android Emulator: use http://10.0.2.2:8000 (it maps to your PC's localhost)
 * For physical Android device: use your PC's local IP (e.g. http://192.168.1.100:8000)
 */

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  PHYSICAL DEVICE: Replace with your PC's local IP address
// Run `ipconfig` in cmd → look for "IPv4 Address" under your WiFi adapter
// Example: http://192.168.1.100:8000
// Both your phone AND PC must be connected to the SAME WiFi network
export const BASE_URL = 'http://YOUR_PC_IP:8000'; // <-- CHANGE THIS

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const authData = await AsyncStorage.getItem('wasify-auth');
  if (authData) {
    const parsed = JSON.parse(authData);
    const token = parsed?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 - token expired
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and force re-login
      await AsyncStorage.removeItem('wasify-auth');
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    api.post('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/login', { email, password }),

  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', { refresh_token }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { full_name?: string }) => api.patch('/users/me', data),
};

// ── Detections ────────────────────────────────────────────────────────────────

export const detectionApi = {
  list: (limit = 20, offset = 0) =>
    api.get('/detections', { params: { limit, offset } }),

  classify: (imageUri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);
    return api.post('/detections/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  saveOnDevice: (category: string, confidence: number, imageUri?: string) => {
    const formData = new FormData();
    formData.append('category', category);
    formData.append('confidence', String(confidence));
    formData.append('source', 'on_device');
    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'scan.jpg',
      } as any);
    }
    return api.post('/detections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardApi = {
  get: (limit = 50) => api.get('/leaderboard', { params: { limit } }),
};

// ── Rewards ───────────────────────────────────────────────────────────────────

export const rewardApi = {
  list: () => api.get('/rewards'),
  claim: (reward_id: string) => api.post('/rewards/claim', { reward_id }),
  getClaimed: () => api.get('/rewards/claimed'),
};

export default api;
