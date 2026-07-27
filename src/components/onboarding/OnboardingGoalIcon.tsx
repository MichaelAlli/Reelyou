import { StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import type { OnboardingGoalIconName } from '@/onboarding/types';

const ICON_SYMBOL: Record<OnboardingGoalIconName, SymbolViewProps['name']> = {
  rocket: { ios: 'paperplane.fill', android: 'rocket_launch', web: 'rocket_launch' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  dumbbell: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  dollarsign: { ios: 'dollarsign.circle.fill', android: 'paid', web: 'paid' },
  globe: { ios: 'globe.americas.fill', android: 'public', web: 'public' },
  airplane: { ios: 'airplane', android: 'flight', web: 'flight' },
  briefcase: { ios: 'briefcase.fill', android: 'work', web: 'work' },
  brain: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  cross: { ios: 'sparkle', android: 'auto_awesome', web: 'auto_awesome' },
  graduationcap: { ios: 'graduationcap.fill', android: 'school', web: 'school' },
  palette: { ios: 'paintpalette.fill', android: 'palette', web: 'palette' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
};

interface OnboardingGoalIconProps {
  name: OnboardingGoalIconName;
  size?: number;
  color?: string;
}

export function OnboardingGoalIcon({
  name,
  size = OnboardingProfileLayout.chipIconSize,
  color = OnboardingProfileLayout.goldAccent,
}: OnboardingGoalIconProps) {
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
