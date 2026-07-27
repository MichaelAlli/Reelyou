import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingGoalsLayout } from '@/constants/onboardingGoalsLayout';
import { Fonts } from '@/constants/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number | null;
  stepLabel?: string;
}

/** Flexible onboarding progress — total steps optional until flow is finalized. */
function OnboardingProgressComponent({
  currentStep,
  totalSteps = null,
  stepLabel,
}: OnboardingProgressProps) {
  const progressText =
    totalSteps != null
      ? `Step ${currentStep} of ${totalSteps}`
      : `Step ${currentStep}`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${progressText}${stepLabel ? `. ${stepLabel}` : ''}`}
      style={styles.wrap}>
      <Text style={styles.label}>{progressText}</Text>
      {stepLabel ? <Text style={styles.stepLabel}>{stepLabel}</Text> : null}
    </View>
  );
}

export const OnboardingProgress = memo(OnboardingProgressComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: OnboardingGoalsLayout.hintColor,
    textTransform: 'uppercase',
  },
  stepLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: OnboardingGoalsLayout.hintColor,
    textAlign: 'center',
  },
});
