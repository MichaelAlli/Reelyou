import { memo } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

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

/** Rising star entering open sky vault — immersive / full-sky mode. */
function ImmersiveSkyEnterGlyphComponent({
  size = 20,
  color = MySkyControlColors.iconDefault,
  strokeWidth = 1.55,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={8} cy={8.1} r={4.4} fill="rgba(232, 200, 114, 0.1)" />
      <Path
        d="M 3.1 10.3 Q 3.1 3.6 8 2.4 Q 12.9 3.6 12.9 10.3"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={8}
        y1={5.8}
        x2={8}
        y2={4.1}
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Line
        x1={6.6}
        y1={6.4}
        x2={5.7}
        y2={5.4}
        stroke={color}
        strokeWidth={strokeWidth * 0.65}
        strokeLinecap="round"
        opacity={0.42}
      />
      <Line
        x1={9.4}
        y1={6.4}
        x2={10.3}
        y2={5.4}
        stroke={color}
        strokeWidth={strokeWidth * 0.65}
        strokeLinecap="round"
        opacity={0.42}
      />
      <Path d="M8 6.2 L8.7 8 L8 9.8 L7.3 8 Z" fill={color} />
      <Path d="M6.7 8 L8 7.45 L9.3 8 L8 8.55 Z" fill={color} opacity={0.88} />
      <Circle cx={5.2} cy={4.8} r={0.55} fill={color} opacity={0.55} />
      <Circle cx={10.8} cy={4.8} r={0.55} fill={color} opacity={0.55} />
      <Line
        x1={4.1}
        y1={11.2}
        x2={11.9}
        y2={11.2}
        stroke={color}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
        opacity={0.32}
      />
    </Svg>
  );
}

/** Luminous sky portal engaged — tap to return from immersive mode. */
function ImmersiveSkyExitGlyphComponent({
  size = 20,
  color = MySkyControlColors.iconActive,
  strokeWidth = 1.65,
}: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={5.7} fill="rgba(232, 200, 114, 0.16)" />
      <Circle cx={8} cy={8} r={5.7} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={8}
        cy={8}
        r={3.4}
        stroke={color}
        strokeWidth={strokeWidth * 0.45}
        fill="none"
        opacity={0.48}
      />
      <Path d="M8 5.3 L9.05 8 L8 10.7 L6.95 8 Z" fill={color} />
      <Path d="M5.75 8 L8 7.15 L10.25 8 L8 8.85 Z" fill={color} />
      <Circle cx={8} cy={8} r={1.05} fill={color} />
      <Path
        d="M 5.4 11.3 Q 8 12.8 10.6 11.3"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth * 0.55}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

export const SearchGlyph = memo(SearchGlyphComponent);
export const ExploreGlyph = memo(ExploreGlyphComponent);
export const ImmersiveSkyEnterGlyph = memo(ImmersiveSkyEnterGlyphComponent);
export const ImmersiveSkyExitGlyph = memo(ImmersiveSkyExitGlyphComponent);
