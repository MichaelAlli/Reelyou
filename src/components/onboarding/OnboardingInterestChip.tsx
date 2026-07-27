import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { OnboardingInterestIcon } from '@/components/onboarding/OnboardingInterestIcon';
import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';
import type { OnboardingInterestOption } from '@/onboarding/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OnboardingInterestChipProps {
  option: OnboardingInterestOption;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

function OnboardingInterestChipComponent({
  option,
  selected,
  disabled,
  onPress,
  style,
}: OnboardingInterestChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={option.label}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
      }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled, style, animatedStyle]}>
      <OnboardingInterestIcon name={option.icon} />
      <Text style={styles.label} numberOfLines={2}>
        {option.label}
      </Text>
      <View style={[styles.indicator, selected && styles.indicatorSelected]}>
        {selected ? <View style={styles.indicatorDot} /> : null}
      </View>
    </AnimatedPressable>
  );
}

export const OnboardingInterestChip = memo(OnboardingInterestChipComponent);

const layout = OnboardingProfileLayout;

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minHeight: layout.chipMinHeight,
    borderRadius: layout.chipRadius,
    borderWidth: layout.chipBorderWidth,
    borderColor: layout.chipBorder,
    backgroundColor: layout.chipSurface,
    paddingHorizontal: layout.chipHorizontalPadding,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: layout.chipSelectedSurface,
    borderColor: layout.goldAccent,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '500',
    color: layout.titleColor,
  },
  indicator: {
    width: layout.indicatorSize,
    height: layout.indicatorSize,
    borderRadius: layout.indicatorSize / 2,
    borderWidth: 1.5,
    borderColor: layout.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    backgroundColor: layout.goldAccent,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#050818',
  },
});
