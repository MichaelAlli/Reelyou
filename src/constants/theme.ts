import { Platform } from 'react-native';

import { darkThemeTokens, lightThemeTokens } from '@/theme/tokens';

/** Legacy Expo template color map — prefer useTheme() tokens in app UI. */
export type ThemeColor =
  | 'background'
  | 'text'
  | 'backgroundElement'
  | 'backgroundSelected'
  | 'textSecondary';

export const Colors = {
  light: {
    background: lightThemeTokens.appBackground,
    text: lightThemeTokens.primaryText,
    backgroundElement: lightThemeTokens.elevatedSurface,
    backgroundSelected: lightThemeTokens.cardSurface,
    textSecondary: lightThemeTokens.secondaryText,
  },
  dark: {
    background: darkThemeTokens.appBackground,
    text: darkThemeTokens.primaryText,
    backgroundElement: darkThemeTokens.elevatedSurface,
    backgroundSelected: darkThemeTokens.cardSurface,
    textSecondary: darkThemeTokens.secondaryText,
  },
} as const;

/** @deprecated Prefer semantic tokens from useTheme() for theme-aware UI. */
export const CosmicTheme = {
  background: darkThemeTokens.appBackground,
  backgroundSecondary: '#0a0f2e',
  backgroundElevated: darkThemeTokens.elevatedSurface,
  card: darkThemeTokens.cardSurface,
  cardBorder: darkThemeTokens.border,
  gold: darkThemeTokens.gold,
  goldLight: darkThemeTokens.goldLight,
  goldMuted: darkThemeTokens.goldMuted,
  purple: darkThemeTokens.purple,
  purpleSoft: darkThemeTokens.purpleSoft,
  purpleGlow: darkThemeTokens.purpleGlow,
  white: '#FFFFFF',
  textPrimary: darkThemeTokens.primaryText,
  textSecondary: darkThemeTokens.secondaryText,
  textMuted: darkThemeTokens.mutedText,
  success: darkThemeTokens.success,
  star: darkThemeTokens.star,
  tabBar: darkThemeTokens.navigationBackground,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'Georgia', mono: 'Menlo' },
  default: { sans: 'sans-serif', serif: 'serif', mono: 'monospace' },
  web: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, serif',
    mono: 'monospace',
  },
})!;

export const MaxContentWidth = 640;
export const TabBarHeight = Platform.select({ web: 72, default: 84 }) ?? 84;

import { ReelyouMotion } from '@/constants/animation';

export const Gradients = {
  auroraTop: CosmicTheme.purpleGlow,
  auroraBottom: CosmicTheme.goldMuted,
  splashVignette: 'rgba(3, 5, 16, 0.35)',
  goldGlow: 'rgba(212, 175, 55, 0.55)',
} as const;

/** @deprecated Prefer ReelyouMotion from @/constants/animation */
export const AnimationDurations = {
  fadeIn: ReelyouMotion.fadeIn,
  slide: ReelyouMotion.slide,
  scale: ReelyouMotion.scale,
  screenTransition: ReelyouMotion.screenTransition,
  glowPulse: ReelyouMotion.glowPulse,
  backgroundZoom: ReelyouMotion.backgroundZoom,
  spinnerRotate: ReelyouMotion.spinnerRotate,
  splashAutoTransition: ReelyouMotion.splashAutoTransition,
} as const;
