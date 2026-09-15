import Svg, { Path } from 'react-native-svg';

import { HomePalette } from '@/constants/homeLayout';

/**
 * Home Skywrite card — right-side send button only.
 * Rendered from HomeSkywriteBar (not bottom nav).
 * Feather-style outlined paper plane ↗ (nose at top-right).
 */
export function HomeSkywriteSendIcon({ size = 16 }: { size?: number }) {
  const stroke = HomePalette.gold;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Send">
      <Path
        d="M 22 2 L 11 13"
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M 22 2 L 2 9 L 11 13"
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M 11 13 L 15 22 L 22 2"
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
