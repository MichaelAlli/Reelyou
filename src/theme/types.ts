import type { StatusBarStyle } from 'expo-status-bar';

/** User-selectable theme preference. */
export type ThemeMode = 'light' | 'dark' | 'system' | 'timeOfDay';

/** Resolved visual appearance applied to post-welcome screens. */
export type ResolvedAppearance = 'light' | 'dark';

/** Semantic theme tokens shared across iOS, Android, and web. */
export interface ThemeTokens {
  appBackground: string;
  surface: string;
  elevatedSurface: string;
  cardBackground: string;
  cardSurface: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  border: string;
  divider: string;
  primaryAction: string;
  secondaryAction: string;
  inputBackground: string;
  inputText: string;
  placeholderText: string;
  navigationBackground: string;
  navigationActive: string;
  navigationInactive: string;
  navigationIconActive: string;
  navigationIconInactive: string;
  statusBarStyle: StatusBarStyle;
  /** Brand accent tokens used by existing UI components. */
  gold: string;
  goldLight: string;
  goldMuted: string;
  purple: string;
  purpleSoft: string;
  purpleGlow: string;
  success: string;
  star: string;
}

export interface ThemeContextValue {
  themeMode: ThemeMode;
  resolvedAppearance: ResolvedAppearance;
  tokens: ThemeTokens;
  isReady: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  /** Dev-only: override clock for Time of Day testing. */
  setTimeOverride: (date: Date | null) => void;
  /** Dev-only: temporary appearance override without persisting preference. */
  setDevAppearanceOverride?: (appearance: ResolvedAppearance | null) => void;
  clearDevAppearanceOverride?: () => void;
}

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  timeOfDay: 'Time of Day',
};

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system', 'timeOfDay'];

/** Cinematic dark background for Splash and Welcome — never follows global theme. */
export const LOCKED_CINEMATIC_BACKGROUND = '#050818';
