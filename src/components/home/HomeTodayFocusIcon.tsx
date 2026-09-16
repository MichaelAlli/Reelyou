import Svg, { Circle, Line, Path } from 'react-native-svg';

import { HomePalette } from '@/constants/homeLayout';

/**
 * Today’s Focus — intention / clarity mark.
 * Concentric focus ring + inner light + subtle directional ray.
 */
export function HomeTodayFocusIcon({ size = 18 }: { size?: number }) {
  const violet = HomePalette.purple;
  const gold = HomePalette.gold;
  const core = HomePalette.goldBright;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={8.25}
        fill="none"
        stroke={violet}
        strokeWidth={1.05}
        opacity={0.82}
      />
      <Circle
        cx={12}
        cy={12}
        r={4.75}
        fill="none"
        stroke={gold}
        strokeWidth={0.75}
        opacity={0.48}
      />
      <Circle cx={12} cy={12} r={1.65} fill={core} opacity={0.96} />
      <Line
        x1={12}
        y1={12}
        x2={16.25}
        y2={7.75}
        stroke={gold}
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.62}
      />
      <Path
        d="M 16.25 7.75 L 14.6 8.1 L 15.9 9.4 Z"
        fill={gold}
        opacity={0.55}
      />
    </Svg>
  );
}
