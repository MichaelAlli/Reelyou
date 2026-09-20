import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { StarPathTypography } from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';

interface NorthStarLabelProps {
  x: number;
  y: number;
}

/** Center-axis label — x is the screen center line. */
function NorthStarLabelComponent({ x, y }: NorthStarLabelProps) {
  return (
    <View
      style={[styles.root, { left: x, top: y }]}
      pointerEvents="none"
      testID="north-star-beacon"
      accessibilityRole="text"
      accessibilityLabel="North Star destination"
    >
      <Text style={styles.label}>NORTH STAR</Text>
    </View>
  );
}

export const NorthStarLabel = memo(NorthStarLabelComponent);
export const NorthStarBeacon = NorthStarLabel;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    transform: [{ translateX: '-50%' }],
    alignItems: 'center',
    minWidth: 120,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.4,
    lineHeight: 13,
    textAlign: 'center',
    color: StarPathTypography.warmWhite,
    ...(Platform.OS === 'web'
      ? ({ textShadow: '0 1px 8px rgba(255, 210, 120, 0.32)' } as object)
      : {
          textShadowColor: 'rgba(255, 210, 120, 0.32)',
          textShadowRadius: 3,
          textShadowOffset: { width: 0, height: 1 },
        }),
  },
});
