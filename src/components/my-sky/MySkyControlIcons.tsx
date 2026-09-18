import { memo } from 'react';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';

interface GlyphProps {
  size?: number;
  color?: string;
  active?: boolean;
  strokeWidth?: number;
}

/** Magnifying glass — Search control. */
function SearchGlyphComponent({
  size = 16,
  color = MySkyControlColors.iconDefault,
  strokeWidth = 1.65,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={7} cy={7} r={4.1} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Line
        x1={10.1}
        y1={10.1}
        x2={14.2}
        y2={14.2}
        stroke={color}
        strokeWidth={strokeWidth + 0.15}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Compass rose — Explore control. */
function ExploreGlyphComponent({
  size = 16,
  color = MySkyControlColors.iconDefault,
  active = false,
  strokeWidth = 1.25,
}: GlyphProps) {
  const fill = active ? color : 'transparent';
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle
        cx={8}
        cy={8}
        r={5.8}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={active ? 1 : 0.9}
      />
      <Path d="M8 3.2 L9.1 8 L8 12.8 L6.9 8 Z" fill={fill} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M3.2 8 L8 6.9 L12.8 8 L8 9.1 Z"
        fill={fill}
        opacity={active ? 0.5 : 0}
        stroke={color}
        strokeWidth={strokeWidth * 0.85}
      />
      <Circle cx={8} cy={8} r={1.15} fill={color} />
    </Svg>
  );
}

/** Upward chevron — restore controls from Clean Sky. */
function RestoreGlyphComponent({
  size = 18,
  color = MySkyControlColors.iconActive,
  strokeWidth = 2,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={7} fill="rgba(232, 200, 114, 0.1)" />
      <Polyline
        points="4,10.5 8,4.8 12,10.5"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1={8}
        y1={4.8}
        x2={8}
        y2={12.8}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

/** Downward chevron — enter Clean Sky from layer row. */
function ImmersiveGlyphComponent({
  size = 14,
  color = MySkyControlColors.iconDefault,
  strokeWidth = 1.6,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Polyline
        points="4,5.5 8,11.2 12,5.5"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const SearchGlyph = memo(SearchGlyphComponent);
export const ExploreGlyph = memo(ExploreGlyphComponent);
export const RestoreGlyph = memo(RestoreGlyphComponent);
export const ImmersiveGlyph = memo(ImmersiveGlyphComponent);
