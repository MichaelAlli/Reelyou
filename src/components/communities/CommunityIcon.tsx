import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { CommunityIconType } from '@/constants/communitiesData';

interface CommunityIconProps {
  type: CommunityIconType;
  color: string;
  size?: number;
}

/** Refined line icons for community cards — calm, human, mobile-friendly. */
export function CommunityIcon({ type, color, size = 22 }: CommunityIconProps) {
  const stroke = color;
  const sw = 1.2;

  if (type === 'briefcase') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Entrepreneurship">
        <Rect x={4} y={8} width={16} height={11} rx={1.8} fill="none" stroke={stroke} strokeWidth={sw} />
        <Path d="M 9 8 V 6.5 C 9 5.67 9.67 5 10.5 5 H 13.5 C 14.33 5 15 5.67 15 6.5 V 8" fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'leaf') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Personal Growth">
        <Path d="M 12 20 C 12 20 5 16 5 10 C 5 6 8 4 12 4 C 16 4 19 6 19 10 C 19 16 12 20 12 20 Z" fill="none" stroke={stroke} strokeWidth={sw} />
        <Path d="M 12 20 V 9" fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'creative') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Creativity">
        <Path d="M 14 4 L 20 10 L 10 20 L 4 20 L 4 14 Z" fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'community') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Purpose Seekers">
        <Circle cx={9} cy={8.5} r={2.4} fill="none" stroke={stroke} strokeWidth={sw} />
        <Circle cx={15.5} cy={8.5} r={2.4} fill="none" stroke={stroke} strokeWidth={sw} />
        <Path d="M 5.5 18 C 5.5 15.2 7.2 13.5 9 13.5 C 10.2 13.5 11.2 14.2 12 15.2 C 12.8 14.2 13.8 13.5 15 13.5 C 16.8 13.5 18.5 15.2 18.5 18" fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'career') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Career Growth">
        <Path d="M 4 19 V 9 L 12 4 L 20 9 V 19" fill="none" stroke={stroke} strokeWidth={sw} />
        <Rect x={9} y={13} width={6} height={6} rx={0.8} fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'wellness') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Wellness">
        <Path d="M 12 20 C 8 16 5 13 5 10 A 4 4 0 0 1 12 7 A 4 4 0 0 1 19 10 C 19 13 16 16 12 20 Z" fill="none" stroke={stroke} strokeWidth={sw} />
      </Svg>
    );
  }

  if (type === 'leadership') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Leadership">
        <Path d="M 12 3 L 14.5 9 H 21 L 16 13 L 18 20 L 12 16 L 6 20 L 8 13 L 3 9 H 9.5 Z" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Travel and Culture">
      <Circle cx={12} cy={12} r={8} fill="none" stroke={stroke} strokeWidth={sw} />
      <Path d="M 4 12 H 20 M 12 4 C 9 8 9 16 12 20 M 12 4 C 15 8 15 16 12 20" fill="none" stroke={stroke} strokeWidth={sw * 0.85} />
    </Svg>
  );
}
