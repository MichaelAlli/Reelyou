import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/** Decorative shooting-star trail for the share footer. */
export function SkywriteShootingStar({ width = 320, height = 72 }: { width?: number; height?: number }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Svg width={width} height={height} viewBox="0 0 320 72">
      <Defs>
        <LinearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#A78BFA" stopOpacity={0.05} />
          <Stop offset="45%" stopColor="#E879A8" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#F5D76E" stopOpacity={0.95} />
        </LinearGradient>
      </Defs>
      <Path
        d="M 8 58 Q 120 52 210 38 Q 260 28 300 12"
        fill="none"
        stroke="url(#trail)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M 24 56 Q 130 48 220 34"
        fill="none"
        stroke="rgba(196, 168, 255, 0.35)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Circle cx={300} cy={12} r={5.5} fill="#F5D76E" />
      <Circle cx={300} cy={12} r={9} fill="rgba(245, 214, 110, 0.28)" />
      <Path
        d="M 296 8 L 304 12 L 296 16 L 298 12 Z"
        fill="#FFF8E7"
        opacity={0.95}
      />
    </Svg>
    </View>
  );
}
