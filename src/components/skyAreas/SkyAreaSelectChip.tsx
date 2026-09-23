import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { HomeGrowingInPillIcon } from '@/components/home/HomeGrowingInPillIcon';
import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';
import type { SkyArea } from '@/skyAreas/skyAreaDefinition';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SkyAreaSelectChipProps {
  area: SkyArea;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

function SkyAreaSelectChipComponent({ area, selected, onPress, style }: SkyAreaSelectChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={area.label}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
      }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, style, animatedStyle]}>
      <HomeGrowingInPillIcon type={area.icon} size={18} color={layout.goldAccent} />
      <Text style={styles.label} numberOfLines={2}>
        {area.label}
      </Text>
      <View style={[styles.indicator, selected && styles.indicatorSelected]}>
        {selected ? <View style={styles.indicatorDot} /> : null}
      </View>
    </AnimatedPressable>
  );
}

export const SkyAreaSelectChip = memo(SkyAreaSelectChipComponent);

const layout = OnboardingProfileLayout;

const styles = StyleSheet.create({
  chip: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: layout.chipMinHeight,
    borderRadius: layout.chipRadius,
    borderWidth: layout.chipBorderWidth,
    borderColor: layout.chipBorder,
    backgroundColor: layout.chipSurface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: layout.chipSelectedSurface,
    borderColor: layout.goldAccent,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    fontWeight: '600',
    color: layout.titleColor,
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: layout.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    borderColor: layout.goldAccent,
    backgroundColor: 'rgba(232,200,114,0.15)',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: layout.goldAccent,
  },
});
