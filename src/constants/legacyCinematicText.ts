import { darkThemeTokens } from '@/theme/tokens';

/** Legacy Journey uses a fixed dark gradient — text must stay readable in all theme modes. */
export const legacyCinematicText = {
  primary: darkThemeTokens.primaryText,
  secondary: darkThemeTokens.secondaryText,
  muted: darkThemeTokens.mutedText,
  gold: darkThemeTokens.gold,
} as const;
