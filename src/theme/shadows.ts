import { TextStyle, ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * REELYOU shadow tokens.
 */
export const shadows = {
  Small: {
    shadowColor: colors.Black,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } satisfies ViewStyle,

  Medium: {
    shadowColor: colors.Black,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } satisfies ViewStyle,

  Large: {
    shadowColor: colors.Purple,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  } satisfies ViewStyle,

  Glow: {
    shadowColor: colors.Gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  } satisfies ViewStyle,

  TextSoft: {
    textShadowColor: colors.OverlayDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  } satisfies TextStyle,
} as const;

export type ShadowToken = keyof typeof shadows;
