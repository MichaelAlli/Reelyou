import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

interface NorthStarPotentialCaptionProps {
  x: number;
  y: number;
}

/** Reference-style summit caption — small, secondary, under North Star zone. */
function NorthStarPotentialCaptionComponent({ x, y }: NorthStarPotentialCaptionProps) {
  return (
    <View
      style={[styles.root, { left: x - 56, top: y }]}
      pointerEvents="none"
      testID="north-star-potential-caption"
      accessibilityRole="text"
      accessibilityLabel="Your Potential at the summit"
    >
      <Svg width={14} height={14}>
        <Circle cx={7} cy={7} r={5.5} fill="rgba(12, 14, 28, 0.85)" stroke="rgba(232, 200, 114, 0.45)" strokeWidth={1} />
        <Circle cx={7} cy={6} r={2} fill="rgba(255, 230, 180, 0.85)" />
      </Svg>
      <Text style={styles.label}>Your Potential</Text>
    </View>
  );
}

export const NorthStarPotentialCaption = memo(NorthStarPotentialCaptionComponent);

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 112,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: 'rgba(255, 248, 235, 0.82)',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
