import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import type { ThemeTokens } from '@/theme/types';

/** Screen 4 layout tokens — reference-accurate North Star card composition. */
export const OnboardingNorthStarLayout = {
  cardRadius: 18,
  cardPaddingHorizontal: 18,
  cardPaddingTop: 20,
  cardPaddingBottom: 16,
  cardBottomGap: 18,
  promptGap: 4,
  promptLine1Size: 15,
  promptLine2Size: 22,
  promptLine3Size: 13,
  inputMinHeight: 148,
  inputRadius: 14,
  inputBorderWidth: 1,
  inputPaddingHorizontal: 14,
  inputPaddingTop: 14,
  inputPaddingBottom: 32,
  inputFontSize: 14,
  inputLineHeight: 21,
  counterSize: 11,
  skipTopGap: 14,
  logoWidthFactor: 0.72,
} as const;

export function northStarCardStyle(isLight: boolean): ViewStyle {
  return {
    backgroundColor: '#000000',
    borderRadius: OnboardingNorthStarLayout.cardRadius,
    paddingHorizontal: OnboardingNorthStarLayout.cardPaddingHorizontal,
    paddingTop: OnboardingNorthStarLayout.cardPaddingTop,
    paddingBottom: OnboardingNorthStarLayout.cardPaddingBottom,
    width: '100%',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isLight ? 0.22 : 0.45,
          shadowRadius: 18,
        }
      : Platform.OS === 'android'
        ? { elevation: 12 }
        : {}),
  };
}

export function northStarSkipStyle(tokens: ThemeTokens, isLight: boolean): TextStyle {
  return {
    color: isLight ? tokens.primaryText : 'rgba(248, 249, 252, 0.78)',
    textDecorationLine: 'underline',
    textDecorationColor: OnboardingProfileLayout.goldAccent,
  };
}
