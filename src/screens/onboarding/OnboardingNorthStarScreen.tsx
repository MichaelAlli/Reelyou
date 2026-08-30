/**
 * REELYOU Onboarding Screen 4 — North Star
 *
 * ONBOARDING BACKGROUND SYSTEM v1.0 | Unified onboarding state
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  OnboardingBackButton,
  OnboardingBrandHeader,
  OnboardingNorthStarInput,
  OnboardingPrimaryButton,
  OnboardingScreenShell,
} from '@/components/onboarding';
import { OnboardingNorthStarCopy } from '@/constants/onboardingNorthStarCopy';
import {
  northStarCardStyle,
  northStarSkipStyle,
  OnboardingNorthStarLayout,
} from '@/constants/onboardingNorthStarLayout';
import {
  onboardingTitleShadow,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';
import { ReelyouMotion } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useTheme } from '@/theme/useTheme';

export function OnboardingNorthStarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isLight, tokens } = useTheme();
  const { northStar, setNorthStarVision, markStep } = useOnboarding();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);

  const logoWidth = Math.min(
    width * OnboardingNorthStarLayout.logoWidthFactor,
    OnboardingProfileLayout.logoWidthMax,
  );

  const hasRequiredVision = useMemo(
    () => northStar.originalVision.trim().length > 0,
    [northStar.originalVision],
  );

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      foregroundOpacity.value = 1;
      foregroundTranslateY.value = 0;
      return;
    }
    foregroundOpacity.value = withTiming(1, { duration: ReelyouMotion.fadeIn });
    foregroundTranslateY.value = withTiming(0, { duration: ReelyouMotion.slide });
  }, [foregroundOpacity, foregroundTranslateY, reduceMotion]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/onboarding/challenges' as never);
  }, [router]);

  const handleHardwareBack = useCallback(() => {
    handleBack();
    return true;
  }, [handleBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => subscription.remove();
  }, [handleHardwareBack]);

  const foregroundStyle = useAnimatedStyle(() => ({
    opacity: foregroundOpacity.value,
    transform: [{ translateY: foregroundTranslateY.value }],
  }));

  const advance = useCallback(
    (options?: { allowEmpty?: boolean }) => {
      setValidationError(null);

      if (!options?.allowEmpty && !hasRequiredVision) {
        setValidationError(OnboardingNorthStarCopy.validationRequired);
        return;
      }

      setIsSubmitting(true);
      markStep('screen4', options?.allowEmpty ? 'skipped' : 'completed');

      setTimeout(() => {
        setIsSubmitting(false);
        router.replace('/process' as never);
      }, 300);
    },
    [hasRequiredVision, markStep, router],
  );

  const handleCreateStarpath = useCallback(() => {
    advance();
  }, [advance]);

  const handleSkip = useCallback(() => {
    advance({ allowEmpty: true });
  }, [advance]);

  const titleShadow = onboardingTitleShadow();
  const cardStyle = northStarCardStyle(isLight);
  const skipTextStyle = northStarSkipStyle(tokens, isLight);

  return (
    <OnboardingScreenShell
      leadingAccessory={
        <OnboardingBackButton
          onPress={handleBack}
          accessibilityLabel="Go back to Onboarding Screen 3"
        />
      }>
      <Animated.View style={foregroundStyle}>
        <View style={cardStyle}>
          <OnboardingBrandHeader logoWidth={logoWidth} />

          <View style={styles.promptBlock}>
            <Text style={[styles.promptLine1, titleShadow]}>{OnboardingNorthStarCopy.promptLine1}</Text>
            <Text style={styles.promptLine2}>{OnboardingNorthStarCopy.promptLine2}</Text>
            <Text style={styles.promptLine3}>{OnboardingNorthStarCopy.promptLine3}</Text>
          </View>

          <OnboardingNorthStarInput
            value={northStar.originalVision}
            onChangeText={setNorthStarVision}
          />
        </View>

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        <View style={styles.ctaBlock}>
          <OnboardingPrimaryButton
            label={OnboardingNorthStarCopy.createStarpath}
            onPress={handleCreateStarpath}
            disabled={!hasRequiredVision}
            loading={isSubmitting}
            variant="gradient"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={OnboardingNorthStarCopy.skip}
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.82 }]}>
          <Text style={[styles.skipLabel, skipTextStyle]}>{OnboardingNorthStarCopy.skip}</Text>
        </Pressable>
      </Animated.View>
    </OnboardingScreenShell>
  );
}

const layout = OnboardingProfileLayout;
const nsLayout = OnboardingNorthStarLayout;

const styles = StyleSheet.create({
  promptBlock: {
    alignItems: 'center',
    gap: nsLayout.promptGap,
    marginTop: 4,
  },
  promptLine1: {
    fontFamily: Fonts.sans,
    fontSize: nsLayout.promptLine1Size,
    fontWeight: '600',
    color: layout.titleColor,
    textAlign: 'center',
  },
  promptLine2: {
    fontFamily: Fonts.sans,
    fontSize: nsLayout.promptLine2Size,
    fontWeight: '700',
    color: layout.goldAccent,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  promptLine3: {
    fontFamily: Fonts.sans,
    fontSize: nsLayout.promptLine3Size,
    fontWeight: '400',
    color: layout.subtitleColor,
    textAlign: 'center',
    marginTop: 2,
  },
  error: {
    marginTop: 10,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: layout.errorColor,
    textAlign: 'center',
  },
  ctaBlock: {
    marginTop: nsLayout.cardBottomGap,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: nsLayout.skipTopGap,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
