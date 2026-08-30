/**
 * REELYOU Onboarding Screen 3 — Challenges
 *
 * Uses ONBOARDING BACKGROUND SYSTEM v1.0 and unified onboarding state.
 * Foreground matches Screen 2 design language (brand header, chips, callout, CTA).
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  OnboardingChallengeChip,
  OnboardingPrimaryButton,
  OnboardingPurposeCallout,
  OnboardingScreenShell,
  OnboardingSelectionCounter,
} from '@/components/onboarding';
import { ONBOARDING_CHALLENGE_ROWS } from '@/constants/onboardingChallenges';
import {
  formatChallengeSelectionCount,
  OnboardingChallengesCopy,
} from '@/constants/onboardingChallengesCopy';
import { OnboardingChallengesLayout } from '@/constants/onboardingChallengesLayout';
import {
  onboardingTitleShadow,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';
import { ReelyouMotion } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { MAX_ONBOARDING_CHALLENGES, useOnboarding } from '@/onboarding';

export function OnboardingChallengesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    challenges,
    toggleChallenge,
    isChallengeSelected,
    canSelectMoreChallenges,
    markStep,
  } = useOnboarding();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);

  const logoWidth = Math.min(width * 0.78, OnboardingProfileLayout.logoWidthMax);

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
    foregroundTranslateY.value = withTiming(0, { duration: ReelyouMotion.fadeIn });
  }, [foregroundOpacity, foregroundTranslateY, reduceMotion]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/onboarding/goals' as never);
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

  const saveAndAdvance = useCallback(
    (options?: { allowEmpty?: boolean }) => {
      setValidationError(null);

      if (!options?.allowEmpty && challenges.length === 0) {
        setValidationError(OnboardingChallengesCopy.validationSelectOne);
        return;
      }

      setIsSubmitting(true);
      markStep('challenges', options?.allowEmpty ? 'skipped' : 'completed');

      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/onboarding/north-star' as never);
      }, 300);
    },
    [challenges.length, markStep, router],
  );

  const handleContinue = useCallback(() => {
    saveAndAdvance();
  }, [saveAndAdvance]);

  const handleSkip = useCallback(() => {
    saveAndAdvance({ allowEmpty: true });
  }, [saveAndAdvance]);

  return (
    <OnboardingScreenShell leadingAccessory={<OnboardingBackButton onPress={handleBack} accessibilityLabel="Go back to Onboarding Screen 2" />}>
      <Animated.View style={foregroundStyle}>
        <OnboardingBrandHeader logoWidth={logoWidth} />

        <View style={styles.questionBlock}>
          <Text style={styles.question}>{OnboardingChallengesCopy.title}</Text>
          <Text style={styles.hint}>{OnboardingChallengesCopy.subtitle}</Text>
          <OnboardingSelectionCounter
            selectedCount={challenges.length}
            maxCount={MAX_ONBOARDING_CHALLENGES}
            label={formatChallengeSelectionCount(challenges.length, MAX_ONBOARDING_CHALLENGES)}
            itemNoun="challenges"
          />
        </View>

        <View
          style={styles.grid}
          accessibilityRole="none"
          accessibilityLabel="Challenge options. Choose up to five.">
          {ONBOARDING_CHALLENGE_ROWS.map(([left, right]) => (
            <View key={`${left.id}-${right.id}`} style={styles.gridRow}>
              <OnboardingChallengeChip
                option={left}
                selected={isChallengeSelected(left.id)}
                disabled={!isChallengeSelected(left.id) && !canSelectMoreChallenges}
                onPress={() => {
                  setValidationError(null);
                  toggleChallenge(left.id);
                }}
                style={styles.gridChip}
              />
              <OnboardingChallengeChip
                option={right}
                selected={isChallengeSelected(right.id)}
                disabled={!isChallengeSelected(right.id) && !canSelectMoreChallenges}
                onPress={() => {
                  setValidationError(null);
                  toggleChallenge(right.id);
                }}
                style={styles.gridChip}
              />
            </View>
          ))}
        </View>

        <OnboardingPurposeCallout message={OnboardingChallengesCopy.purposeCallout} />

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        <View style={styles.ctaBlock}>
          <OnboardingPrimaryButton
            label={OnboardingChallengesCopy.continue}
            onPress={handleContinue}
            disabled={challenges.length === 0}
            loading={isSubmitting}
            variant="solidGold"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={OnboardingChallengesCopy.skip}
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.82 }]}>
          <Text style={styles.skipLabel}>{OnboardingChallengesCopy.skip}</Text>
        </Pressable>
      </Animated.View>
    </OnboardingScreenShell>
  );
}

const layout = OnboardingProfileLayout;
const challengesLayout = OnboardingChallengesLayout;
const titleShadow = onboardingTitleShadow();

const styles = StyleSheet.create({
  questionBlock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: layout.sectionGap,
  },
  question: {
    fontFamily: Fonts.sans,
    fontSize: layout.questionSize,
    fontWeight: '700',
    color: layout.titleColor,
    textAlign: 'center',
    ...titleShadow,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: layout.hintSize,
    lineHeight: 18,
    color: layout.hintColor,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  grid: {
    gap: layout.chipGap,
  },
  gridRow: {
    flexDirection: 'row',
    gap: layout.chipGap,
  },
  gridChip: {
    flex: 1,
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
    marginTop: layout.ctaTopGap,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: challengesLayout.skipTopGap,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: challengesLayout.skipColor,
    textAlign: 'center',
  },
});
