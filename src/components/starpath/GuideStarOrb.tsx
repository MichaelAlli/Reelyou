import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface GuideStarOrbProps {
  size?: number;
}

function GuideStarOrbComponent({ size = 36 }: GuideStarOrbProps) {
  const r = size / 2 - 2;
  const cx = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="guideStarCircle" cx="50%" cy="48%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="50%" stopColor="#B8A0FF" stopOpacity={0.94} />
            <Stop offset="100%" stopColor="#5B45B8" stopOpacity={0.45} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cx} r={r} fill="url(#guideStarCircle)" />
        <Circle cx={cx} cy={cx} r={r} fill="transparent" stroke="#E8DCFF" strokeWidth={1} opacity={0.62} />
      </Svg>
      <Text style={[styles.starGlyph, { fontSize: size * 0.33 }]}>✦</Text>
    </View>
  );
}

export const GuideStarOrb = memo(GuideStarOrbComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlyph: {
    position: 'absolute',
    color: '#FFD57A',
    fontWeight: '700',
  },
});
