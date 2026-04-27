const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Add .tflite files as assets so metro bundles them
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'tflite',
      'bin',
      'onnx',
      'task',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
