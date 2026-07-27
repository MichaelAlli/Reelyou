import { StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import type { OnboardingInterestIconName } from '@/onboarding/types';

const ICON_SYMBOL: Record<OnboardingInterestIconName, SymbolViewProps['name']> = {
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  leaf: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  airplane: { ios: 'airplane', android: 'flight', web: 'flight' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  brain: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  briefcase: { ios: 'briefcase.fill', android: 'work', web: 'work' },
  dumbbell: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  cross: { ios: 'sparkle', android: 'auto_awesome', web: 'auto_awesome' },
  desktop: { ios: 'desktopcomputer', android: 'computer', web: 'computer' },
  dollarsign: { ios: 'dollarsign.circle.fill', android: 'paid', web: 'paid' },
  graduationcap: { ios: 'graduationcap.fill', android: 'school', web: 'school' },
  bubble: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum', web: 'forum' },
};

interface OnboardingInterestIconProps {
  name: OnboardingInterestIconName;
  size?: number;
  color?: string;
}

export function OnboardingInterestIcon({
  name,
  size = OnboardingProfileLayout.chipIconSize,
  color = OnboardingProfileLayout.goldAccent,
}: OnboardingInterestIconProps) {
  return (
    <View style={styles.wrap} importantForAccessibility="no-hide-descendants">
      <SymbolView
        name={ICON_SYMBOL[name]}
        size={size}
        tintColor={color}
        weight="regular"
        style={{ width: size, height: size }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
