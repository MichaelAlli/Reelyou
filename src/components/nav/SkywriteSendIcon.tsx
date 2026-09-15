import Svg, { Path } from 'react-native-svg';

import { HomePalette } from '@/constants/homeLayout';

/**
 * Shared Skywrite send / paper-plane icon — outlined, ↗ orientation.
 * Used by the Home Skywrite card send button and bottom nav Skywrite tab.
 */
export function SkywriteSendIcon({
  size = 16,
  active = true,
}: {
  size?: number;
  active?: boolean;
}) {
  const stroke = active ? HomePalette.gold : 'rgba(210, 198, 235, 0.82)';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Send">
      <Path
        d="M 4.25 17.75 L 19.25 6.25 L 11.5 13.25 L 4.25 17.75"
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M 11.5 13.25 L 19.25 6.25"
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
