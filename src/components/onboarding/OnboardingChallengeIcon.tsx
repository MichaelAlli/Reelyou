import { StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import type { OnboardingChallengeIconName } from '@/onboarding/types';

const ICON_SYMBOL: Record<OnboardingChallengeIconName, SymbolViewProps['name']> = {
  brain: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  briefcase: { ios: 'briefcase.fill', android: 'work', web: 'work' },
  star: { ios: 'sparkle', android: 'star', web: 'star' },
  rocket: { ios: 'paperplane.fill', android: 'rocket_launch', web: 'rocket_launch' },
  shield: { ios: 'shield.fill', android: 'shield', web: 'shield' },
  lotus: { ios: 'leaf.fill', android: 'spa', web: 'spa' },
  dollarsign: { ios: 'dollarsign.circle.fill', android: 'paid', web: 'paid' },
  target: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  leaf: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  people: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  scale: { ios: 'scalemass.fill', android: 'balance', web: 'balance' },
};

interface OnboardingChallengeIconProps {
  name: OnboardingChallengeIconName;
  size?: number;
  color?: string;
}

export function OnboardingChallengeIcon({
  name,
  size = OnboardingProfileLayout.chipIconSize,
  color = OnboardingProfileLayout.goldAccent,
}: OnboardingChallengeIconProps) {
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
