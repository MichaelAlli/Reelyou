/**
 * REELYOU Onboarding Screen 2 v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | DESIGN LOCKED | NAVIGATION VERIFIED | SHARED BACKGROUND v1.0 | READY FOR ONBOARDING SCREEN 3
 * Git rollback tag: "Onboarding Screen 2 v1.0 Design Lock"
 *
 * Visual design is frozen. Only functional, accessibility, responsive,
 * keyboard, safe-area, validation, persistence, integration, and loading/error changes allowed.
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
  OnboardingGoalChip,
  OnboardingPrimaryButton,
  OnboardingPurposeCallout,
  OnboardingScreenShell,
  OnboardingSelectionCounter,
} from '@/components/onboarding';
import { ONBOARDING_GOAL_ROWS } from '@/constants/onboardingGoals';
import {
  formatGoalSelectionCount,
  OnboardingGoalsCopy,
} from '@/constants/onboardingGoalsCopy';
import { OnboardingGoalsLayout } from '@/constants/onboardingGoalsLayout';
import {
  onboardingTitleShadow,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';
import { ReelyouMotion } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { MAX_ONBOARDING_GOALS, useOnboarding } from '@/onboarding';

export function OnboardingGoalsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    goals,
    toggleGoal,
    isGoalSelected,
    canSelectMoreGoals,
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
    router.replace('/onboarding/profile' as never);
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

      if (!options?.allowEmpty && goals.length === 0) {
        setValidationError(OnboardingGoalsCopy.validationSelectOne);
        return;
      }

      setIsSubmitting(true);
      markStep('goals', options?.allowEmpty ? 'skipped' : 'completed');

      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/onboarding/challenges' as never);
      }, 300);
    },
    [goals.length, markStep, router],
  );

  const handleContinue = useCallback(() => {
    saveAndAdvance();
  }, [saveAndAdvance]);

  const handleSkip = useCallback(() => {
    saveAndAdvance({ allowEmpty: true });
  }, [saveAndAdvance]);

  return (
    <OnboardingScreenShell leadingAccessory={<OnboardingBackButton onPress={handleBack} />}>
      <Animated.View style={foregroundStyle}>
        <OnboardingBrandHeader logoWidth={logoWidth} />

        <View style={styles.questionBlock}>
          <Text style={styles.question}>{OnboardingGoalsCopy.title}</Text>
          <Text style={styles.hint}>{OnboardingGoalsCopy.subtitle}</Text>
          <OnboardingSelectionCounter
            selectedCount={goals.length}
            maxCount={MAX_ONBOARDING_GOALS}
            label={formatGoalSelectionCount(goals.length, MAX_ONBOARDING_GOALS)}
            itemNoun="goals"
          />
        </View>

        <View
          style={styles.grid}
          accessibilityRole="none"
          accessibilityLabel="Goal options. Choose up to three.">
          {ONBOARDING_GOAL_ROWS.map(([left, right]) => (
            <View key={`${left.id}-${right.id}`} style={styles.gridRow}>
              <OnboardingGoalChip
                option={left}
                selected={isGoalSelected(left.id)}
                disabled={!isGoalSelected(left.id) && !canSelectMoreGoals}
                onPress={() => {
                  setValidationError(null);
                  toggleGoal(left.id);
                }}
                style={styles.gridChip}
              />
              <OnboardingGoalChip
                option={right}
                selected={isGoalSelected(right.id)}
                disabled={!isGoalSelected(right.id) && !canSelectMoreGoals}
                onPress={() => {
                  setValidationError(null);
                  toggleGoal(right.id);
                }}
                style={styles.gridChip}
              />
            </View>
          ))}
        </View>

        <OnboardingPurposeCallout message={OnboardingGoalsCopy.purposeCallout} />

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        <View style={styles.ctaBlock}>
          <OnboardingPrimaryButton
            label={OnboardingGoalsCopy.continue}
            onPress={handleContinue}
            disabled={goals.length === 0}
            loading={isSubmitting}
            variant="solidGold"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={OnboardingGoalsCopy.skip}
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.82 }]}>
          <Text style={styles.skipLabel}>{OnboardingGoalsCopy.skip}</Text>
        </Pressable>
      </Animated.View>
    </OnboardingScreenShell>
  );
}

const layout = OnboardingProfileLayout;
const goalsLayout = OnboardingGoalsLayout;
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
    marginTop: goalsLayout.skipTopGap,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: goalsLayout.skipColor,
    textAlign: 'center',
  },
});
