import { Platform } from 'react-native';

export const CosmicTheme = {
  background: '#050818',
  backgroundSecondary: '#0a0f2e',
  backgroundElevated: '#111836',
  card: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(212, 175, 55, 0.22)',
  gold: '#D4AF37',
  goldLight: '#F5D76E',
  goldMuted: 'rgba(212, 175, 55, 0.35)',
  purple: '#9B7EDE',
  purpleSoft: 'rgba(155, 126, 222, 0.25)',
  purpleGlow: 'rgba(123, 97, 255, 0.18)',
  white: '#FFFFFF',
  textPrimary: '#F8F9FC',
  textSecondary: 'rgba(248, 249, 252, 0.68)',
  textMuted: 'rgba(248, 249, 252, 0.42)',
  success: '#6EE7B7',
  star: '#FFFFFF',
  tabBar: 'rgba(5, 8, 24, 0.95)',
} as const;

export const Spacing = {
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
