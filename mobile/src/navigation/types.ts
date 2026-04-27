import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { ClassificationResult } from '../types';

// Auth stack
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

// Main tab navigator
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Camera: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

// Camera stack (nested inside Camera tab)
export type CameraStackParamList = {
  CameraMain: undefined;
  Result: { result: ClassificationResult; imageUri?: string };
};

export type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
export type OnboardingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type HistoryScreenProps = BottomTabScreenProps<MainTabParamList, 'History'>;
export type LeaderboardScreenProps = BottomTabScreenProps<MainTabParamList, 'Leaderboard'>;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export type CameraMainScreenProps = NativeStackScreenProps<CameraStackParamList, 'CameraMain'>;
export type ResultScreenProps = NativeStackScreenProps<CameraStackParamList, 'Result'>;
