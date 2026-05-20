/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock all native modules that need native code
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn().mockReturnValue({ id: 'back' }),
  useCameraPermission: jest.fn().mockReturnValue({ hasPermission: true, requestPermission: jest.fn() }),
}));

jest.mock('react-native-fast-tflite', () => ({
  loadTensorflowModel: jest.fn(),
}));

jest.mock('react-native-worklets-core', () => ({}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native');
  return {
    GestureHandlerRootView: RN.View,
    Swipeable: RN.View,
    DrawerLayout: RN.View,
    State: {},
    ScrollView: RN.ScrollView,
    Slider: RN.View,
    Switch: RN.Switch,
    TextInput: RN.TextInput,
    ToolbarAndroid: RN.ToolbarAndroid,
    ViewPagerAndroid: RN.ViewPagerAndroid,
    DrawerLayoutAndroid: RN.DrawerLayoutAndroid,
    WebView: RN.View,
    NativeViewGestureHandler: RN.View,
    TapGestureHandler: RN.View,
    FlingGestureHandler: RN.View,
    ForceTouchGestureHandler: RN.View,
    LongPressGestureHandler: RN.View,
    PanGestureHandler: RN.View,
    PinchGestureHandler: RN.View,
    RotationGestureHandler: RN.View,
    RawButton: RN.View,
    BaseButton: RN.View,
    RectButton: RN.View,
    BorderlessButton: RN.View,
    Pressable: RN.Pressable,
    FlatList: RN.FlatList,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('App smoke test', () => {
  it('module imports without errors', () => {
    expect(() => require('../App')).not.toThrow();
  });
});
