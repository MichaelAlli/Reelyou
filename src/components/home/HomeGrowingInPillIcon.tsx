import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type GrowingInPillIconType = 'briefcase' | 'leaf' | 'creative' | 'community';

interface HomeGrowingInPillIconProps {
  type: GrowingInPillIconType;
  color: string;
  size?: number;
}

/** Refined line icons for Growing In pills — crisp, subtle, color-matched. */
export function HomeGrowingInPillIcon({
  type,
  color,
  size = 14,
}: HomeGrowingInPillIconProps) {
  const stroke = color;
  const sw = 1.15;

  if (type === 'briefcase') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Entrepreneurship">
        <Rect
          x={4}
          y={8}
          width={16}
          height={11}
          rx={1.8}
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <Path
          d="M 9 8 V 6.5 C 9 5.67 9.67 5 10.5 5 H 13.5 C 14.33 5 15 5.67 15 6.5 V 8"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <Path d="M 4 12 H 20" fill="none" stroke={stroke} strokeWidth={sw} opacity={0.55} />
      </Svg>
    );
  }

  if (type === 'leaf') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Personal Growth">
        <Path
          d="M 12 20 C 12 20 5 16 5 10 C 5 6 8 4 12 4 C 16 4 19 6 19 10 C 19 16 12 20 12 20 Z"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <Path
          d="M 12 20 V 9"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <Path
          d="M 12 13 C 10 11 8 10.5 7 11"
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.85}
          strokeLinecap="round"
          opacity={0.7}
        />
      </Svg>
    );
  }

  if (type === 'creative') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Creativity">
        <Path
          d="M 14 4 L 20 10 L 10 20 L 4 20 L 4 14 Z"
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <Path
          d="M 13 5 L 19 11"
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.85}
          strokeLinecap="round"
          opacity={0.65}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Purpose Seekers">
      <Circle cx={9} cy={8.5} r={2.4} fill="none" stroke={stroke} strokeWidth={sw} />
      <Circle cx={15.5} cy={8.5} r={2.4} fill="none" stroke={stroke} strokeWidth={sw} />
      <Path
        d="M 5.5 18 C 5.5 15.2 7.2 13.5 9 13.5 C 10.2 13.5 11.2 14.2 12 15.2 C 12.8 14.2 13.8 13.5 15 13.5 C 16.8 13.5 18.5 15.2 18.5 18"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
