import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { StarPathGlass } from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';

interface YourPotentialMarkerProps {
  x: number;
  y: number;
}

function YourPotentialMarkerComponent({ x, y }: YourPotentialMarkerProps) {
  return (
    <View style={[styles.root, { left: x - 58, top: y - 42 }]} pointerEvents="none">
      <View style={styles.iconWrap}>
        <Svg width={34} height={34}>
          <Circle
            cx={17}
            cy={17}
            r={16}
            fill="rgba(3, 5, 14, 0.72)"
            stroke="rgba(232, 200, 114, 0.35)"
            strokeWidth={1}
          />
          <Path
            d="M 17 9 C 14.5 9 13 10.5 13 13 C 13 15 14.5 16 17 16 C 19.5 16 21 15 21 13 C 21 10.5 19.5 9 17 9 Z M 12 23 C 12 19.5 14 18.5 17 18.5 C 20 18.5 22 19.5 22 23"
            fill="rgba(255, 248, 235, 0.92)"
          />
        </Svg>
      </View>
      <View style={styles.pill}>
        <Text style={styles.label}>Your Potential</Text>
      </View>
    </View>
  );
}

export const YourPotentialMarker = memo(YourPotentialMarkerComponent);

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 116,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: StarPathGlass.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.cardBorder,
    shadowColor: '#FFD57A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 248, 235, 0.94)',
    letterSpacing: 0.15,
  },
});
