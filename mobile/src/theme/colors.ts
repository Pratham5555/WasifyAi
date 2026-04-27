export const Colors = {
  // Backgrounds
  background: '#0A0E1A',
  surface: '#141923',
  card: '#1E2534',
  cardElevated: '#252D40',

  // Brand
  primary: '#00E676',
  primaryDark: '#00C853',
  primaryLight: '#69F0AE',
  secondary: '#1DE9B6',
  accent: '#00BFA5',

  // Gradients (use as gradient stops)
  gradientStart: '#00E676',
  gradientMid: '#00BFA5',
  gradientEnd: '#1DE9B6',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8899AA',
  textMuted: '#4A5568',
  textOnPrimary: '#0A0E1A',

  // Status
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF5252',
  info: '#40C4FF',

  // Waste category colors
  plastic: '#29B6F6',
  cardboard: '#FFA726',
  glass: '#26A69A',
  metal: '#78909C',
  paper: '#BDBDBD',
  organic: '#66BB6A',
  eWaste: '#AB47BC',
  textile: '#EC407A',
  medical: '#EF5350',
  battery: '#FFCA28',
  styrofoam: '#E0E0E0',
  generalTrash: '#607D8B',

  // Borders
  border: '#2A3547',
  borderLight: '#1E2B3C',

  // Tab bar
  tabActive: '#00E676',
  tabInactive: '#4A5568',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(10, 14, 26, 0.85)',
} as const;

export type ColorKey = keyof typeof Colors;
