import { Platform, TextStyle } from 'react-native';

import { colors } from './colors';

const fontFamily = Platform.select({
  ios: 'System',
  default: 'sans-serif',
  web: 'Inter, system-ui, -apple-system, sans-serif',
})!;

/**
 * REELYOU typography tokens — semantic text styles only.
 */
export const typography = {
  Display: {
    fontFamily,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
    letterSpacing: 1.2,
    color: colors.TextPrimary,
    textAlign: 'center',
  } satisfies TextStyle,

  Headline: {
    fontFamily,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0.4,
    color: colors.TextPrimary,
    textAlign: 'center',
  } satisfies TextStyle,

  Title: {
    fontFamily,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: colors.TextPrimary,
    textAlign: 'center',
  } satisfies TextStyle,

  Body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: 0.15,
    color: colors.TextPrimary,
    textAlign: 'center',
  } satisfies TextStyle,

  Caption: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 4.2,
    textTransform: 'uppercase',
    color: colors.Gold,
  } satisfies TextStyle,

  Button: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
    color: colors.White,
  } satisfies TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
