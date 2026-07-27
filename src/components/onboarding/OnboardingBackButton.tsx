import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';

interface OnboardingBackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Subtle gold chevron back control for onboarding Screen 2 header region. */
function OnboardingBackButtonComponent({
  onPress,
  accessibilityLabel = 'Go back to Onboarding Screen 1',
  style,
}: OnboardingBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.hitArea, pressed && styles.pressed, style]}>
      <SymbolView
        name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
        size={20}
        tintColor={OnboardingProfileLayout.goldAccent}
        weight="semibold"
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

export const OnboardingBackButton = memo(OnboardingBackButtonComponent);

const styles = StyleSheet.create({
  hitArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Platform.OS === 'web' ? 0 : -6,
  },
  icon: {
    width: 20,
    height: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
