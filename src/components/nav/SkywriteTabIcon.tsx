import Svg, { Circle, Path } from 'react-native-svg';

import { HomePalette } from '@/constants/homeLayout';

/**
 * Bottom navigation — Skywrite tab only (Option 3: Star with Trail).
 * Rendered from BottomNav when tab.name === 'skywrite'.
 */
export function SkywriteTabIcon({
  size = 21,
  active = false,
}: {
  size?: number;
  active?: boolean;
}) {
  const star = active ? HomePalette.gold : '#E4DCF5';
  const starCore = active ? HomePalette.goldBright : '#FFFEF8';
  const trail = active ? 'rgba(232, 200, 114, 0.9)' : 'rgba(210, 198, 235, 0.72)';
  const trailGlow = active ? 'rgba(245, 230, 184, 0.45)' : 'rgba(210, 198, 235, 0.28)';
  const tailSpark = active ? HomePalette.goldBright : 'rgba(228, 220, 245, 0.8)';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M 1.8 22.2 Q 7.5 17.5 11.5 13.5 Q 14 11 16.8 8.6"
        fill="none"
        stroke={trailGlow}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.75}
      />
      <Path
        d="M 2.4 21.6 Q 8 16.8 12 12.8 Q 14.5 10.3 17 8.2"
        fill="none"
        stroke={trail}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <Path
        d="M 3.6 19.8 Q 8.2 15.6 11.4 12.4"
        fill="none"
        stroke={trail}
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.45}
      />
      <Circle cx={2.4} cy={21.6} r={0.9} fill={tailSpark} opacity={active ? 0.95 : 0.7} />
      <Circle
        cx={17}
        cy={8.2}
        r={3.8}
        fill={active ? 'rgba(245, 230, 184, 0.24)' : 'rgba(210, 198, 235, 0.1)'}
      />
      <Path
        d="M 17 4.4 L 18.5 7.8 L 22 8.2 L 18.5 8.6 L 17 12 L 15.5 8.6 L 12 8.2 L 15.5 7.8 Z"
        fill={star}
      />
      <Path
        d="M 17 6.2 L 17.8 8.2 L 19.8 8.2 L 17.8 8.2 L 17 10.2 L 16.2 8.2 L 14.2 8.2 L 16.2 8.2 Z"
        fill={starCore}
        opacity={active ? 0.95 : 0.75}
      />
      <Circle cx={17} cy={8.2} r={0.6} fill={starCore} opacity={0.98} />
    </Svg>
  );
}
