import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';

interface OnboardingSelectionCounterProps {
  selectedCount: number;
  maxCount: number;
  label: string;
  itemNoun?: string;
}

/** Selection progress pill — matches Screen 2/3 UI reference counter treatment. */
function OnboardingSelectionCounterComponent({
  selectedCount,
  maxCount,
  label,
  itemNoun = 'items',
}: OnboardingSelectionCounterProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${selectedCount} of ${maxCount} ${itemNoun} selected.`}
      style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export const OnboardingSelectionCounter = memo(OnboardingSelectionCounterComponent);

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: OnboardingProfileLayout.goldAccent,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: OnboardingProfileLayout.hintSize,
    fontWeight: '600',
    color: OnboardingProfileLayout.goldAccent,
    textAlign: 'center',
  },
});
