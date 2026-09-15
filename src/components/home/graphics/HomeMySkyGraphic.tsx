import Svg, { Defs, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import {
  FourPointStar,
  PinpointStar,
  PremiumStar,
  SixPointSparkle,
} from '@/components/home/graphics/homeGraphicPrimitives';

/** Focal luminous stars — varied scale and hue. */
const FOCAL = [
  { cx: 46, cy: 20, size: 5.4, color: '#C4A8FF', id: 'f0', intensity: 1.18 },
  { cx: 112, cy: 13, size: 6.2, color: '#8FD4FF', id: 'f1', intensity: 1.28 },
  { cx: 172, cy: 17, size: 6.6, color: '#F5E6B8', id: 'f2', intensity: 1.34 },
  { cx: 234, cy: 15, size: 5.2, color: '#E879A8', id: 'f3', intensity: 1.12 },
  { cx: 284, cy: 22, size: 4.8, color: '#9BE7C4', id: 'f4', intensity: 1.08 },
] as const;

/** Mid-tier 4-point stars. */
const MID = [
  { cx: 26, cy: 36, size: 3.6, color: '#B794F6', id: 'm0', opacity: 0.88 },
  { cx: 76, cy: 32, size: 3.9, color: '#E8C872', id: 'm1', opacity: 0.92 },
  { cx: 140, cy: 34, size: 3.5, color: '#6EC5FF', id: 'm2', opacity: 0.86 },
  { cx: 200, cy: 36, size: 3.7, color: '#E879A8', id: 'm3', opacity: 0.84 },
  { cx: 252, cy: 38, size: 3.4, color: '#5EEAD4', id: 'm4', opacity: 0.82 },
  { cx: 92, cy: 46, size: 3.2, color: '#A78BFA', id: 'm5', opacity: 0.8 },
  { cx: 162, cy: 44, size: 3.3, color: '#D4AF37', id: 'm6', opacity: 0.9 },
] as const;

/** Delicate sparkle accents. */
const SPARKLES = [
  { cx: 60, cy: 11, size: 2.2, color: '#FFFEF8', id: 's0', opacity: 0.58 },
  { cx: 148, cy: 9, size: 2, color: '#E8C872', id: 's1', opacity: 0.52 },
  { cx: 196, cy: 11, size: 2.1, color: '#8FD4FF', id: 's2', opacity: 0.5 },
  { cx: 268, cy: 10, size: 1.9, color: '#C4A8FF', id: 's3', opacity: 0.48 },
] as const;

/** Tiny pinpoints — [x, y, color, size, opacity]. */
const PINPOINTS: Array<[number, number, string, number, number]> = [
  [10, 7, '#FFFEF8', 0.36, 0.62], [32, 4, '#E8C872', 0.32, 0.55], [58, 24, '#8FD4FF', 0.38, 0.58],
  [118, 5, '#C4A8FF', 0.34, 0.6], [138, 26, '#FFFFFF', 0.4, 0.68], [184, 3, '#9BE7C4', 0.3, 0.5],
  [214, 24, '#F5E6B8', 0.36, 0.56], [244, 7, '#B794F6', 0.32, 0.54], [298, 30, '#FFFFFF', 0.38, 0.64],
  [16, 42, '#A78BFA', 0.34, 0.52], [68, 48, '#E879A8', 0.3, 0.48], [128, 46, '#6EC5FF', 0.36, 0.56],
  [188, 50, '#D4AF37', 0.32, 0.54], [262, 46, '#5EEAD4', 0.34, 0.5], [294, 16, '#FFFEF8', 0.4, 0.62],
  [48, 12, '#FFFFFF', 0.28, 0.46], [96, 18, '#E8C872', 0.3, 0.5], [224, 6, '#8FD4FF', 0.32, 0.52],
  [168, 38, '#FF9EAA', 0.3, 0.48], [248, 32, '#9BE7C4', 0.34, 0.5], [6, 26, '#E8C872', 0.28, 0.44],
  [176, 42, '#6EC5FF', 0.32, 0.5], [116, 40, '#D4AF37', 0.3, 0.48], [272, 6, '#F5E6B8', 0.34, 0.52],
  [36, 28, '#C4A8FF', 0.26, 0.42], [208, 30, '#FFFFFF', 0.28, 0.44], [88, 8, '#B794F6', 0.3, 0.46],
  [156, 8, '#8FD4FF', 0.26, 0.4], [280, 36, '#E879A8', 0.28, 0.42],
];

/** Organic constellation — curved segments (not a full network). */
const CURVED_LINKS = [
  'M 46 20 Q 62 14 76 32',
  'M 76 32 Q 94 22 112 13',
  'M 112 13 Q 142 16 172 17',
  'M 172 17 Q 186 28 162 44',
  'M 234 15 Q 248 26 252 38',
] as const;

/** Sparse straight accents between select stars. */
const STRAIGHT_LINKS: Array<[number, number, number, number]> = [
  [172, 17, 200, 36],
  [46, 20, 26, 36],
];

export function HomeMySkyGraphic() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 108" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="skyDeep" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#040610" stopOpacity={1} />
          <Stop offset="28%" stopColor="#0A0818" stopOpacity={0.98} />
          <Stop offset="55%" stopColor="#12102A" stopOpacity={0.94} />
          <Stop offset="82%" stopColor="#281848" stopOpacity={0.72} />
          <Stop offset="100%" stopColor="#482838" stopOpacity={0.58} />
        </LinearGradient>
        <LinearGradient id="skyNebL" x1="0" y1="0" x2="1" y2="0.7">
          <Stop offset="0%" stopColor="#3A2870" stopOpacity={0.38} />
          <Stop offset="45%" stopColor="#281848" stopOpacity={0.18} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyNebR" x1="1" y1="0" x2="0" y2="0.65">
          <Stop offset="0%" stopColor="#2868A8" stopOpacity={0.28} />
          <Stop offset="50%" stopColor="#1A3868" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyHaze" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.05} />
          <Stop offset="42%" stopColor="#C4A8FF" stopOpacity={0.04} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyHorizonGlow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#E87848" stopOpacity={0.22} />
          <Stop offset="45%" stopColor="#C85868" stopOpacity={0.14} />
          <Stop offset="100%" stopColor="#180810" stopOpacity={0.82} />
        </LinearGradient>
        <RadialGradient id="skyBloom" cx="50%" cy="22%" r="68%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.035} />
          <Stop offset="55%" stopColor="#8A68C8" stopOpacity={0.02} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="skyEdgeL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.88} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyEdgeR" x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.82} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyEdgeT" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.68} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="skyEdgeB" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.72} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <RadialGradient id="skyCornerVignette" cx="50%" cy="50%" r="50%">
          <Stop offset="58%" stopColor="#0A0818" stopOpacity={0} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0.38} />
        </RadialGradient>
      </Defs>

      {/* Sky depth layers */}
      <Path d="M0 108 L0 0 L320 0 L320 108 Z" fill="url(#skyDeep)" />
      <Path d="M0 0 L190 0 L190 62 L0 62 Z" fill="url(#skyNebL)" />
      <Path d="M130 0 L320 0 L320 56 L130 56 Z" fill="url(#skyNebR)" />
      <Path d="M0 0 L320 0 L320 108 L0 108 Z" fill="url(#skyHaze)" />
      <Path d="M0 0 L320 0 L320 108 L0 108 Z" fill="url(#skyBloom)" />

      {/* Tiny pinpoints — distant star field */}
      {PINPOINTS.map(([x, y, color, size, opacity], i) => (
        <PinpointStar key={`p-${i}`} cx={x} cy={y} color={color} opacity={opacity} size={size} />
      ))}

      {/* Elegant curved constellation segments */}
      {CURVED_LINKS.map((d, i) => (
        <Path
          key={`c-${i}`}
          d={d}
          fill="none"
          stroke="rgba(245, 230, 184, 0.14)"
          strokeWidth={0.28}
          strokeLinecap="round"
        />
      ))}

      {STRAIGHT_LINKS.map(([x1, y1, x2, y2], i) => (
        <Line
          key={`l-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(245, 230, 184, 0.11)"
          strokeWidth={0.26}
          strokeLinecap="round"
        />
      ))}

      {/* Mid 4-point stars */}
      {MID.map((s) => (
        <FourPointStar
          key={s.id}
          id={s.id}
          cx={s.cx}
          cy={s.cy}
          size={s.size}
          color={s.color}
          opacity={s.opacity}
          rotation={(s.cx + s.cy) % 36}
        />
      ))}

      {/* Subtle sparkle highlights */}
      {SPARKLES.map((s) => (
        <SixPointSparkle key={s.id} id={s.id} cx={s.cx} cy={s.cy} size={s.size} color={s.color} opacity={s.opacity} />
      ))}

      {/* Focal premium stars */}
      {FOCAL.map((s) => (
        <PremiumStar key={s.id} id={s.id} cx={s.cx} cy={s.cy} size={s.size} color={s.color} intensity={s.intensity} />
      ))}

      {/* Horizon atmosphere + layered mountains */}
      <Path d="M0 74 L320 74 L320 108 L0 108 Z" fill="url(#skyHorizonGlow)" opacity={0.42} />
      <Path
        d="M0 80 L38 68 L72 74 L104 62 L144 70 L182 58 L224 66 L320 60 L320 108 L0 108 Z"
        fill="rgba(8,6,18,0.62)"
      />
      <Path
        d="M0 84 L34 72 L66 78 L98 66 L130 74 L162 64 L194 72 L226 62 L258 70 L290 58 L320 54 L320 108 L0 108 Z"
        fill="rgba(4,3,12,0.94)"
      />
      <Path d="M0 92 L320 92 L320 108 L0 108 Z" fill="rgba(232, 132, 58, 0.12)" />

      {/* Edge vignette — blend into card */}
      <Rect x={0} y={0} width={40} height={108} fill="url(#skyEdgeL)" />
      <Rect x={280} y={0} width={40} height={108} fill="url(#skyEdgeR)" />
      <Rect x={0} y={0} width={320} height={24} fill="url(#skyEdgeT)" />
      <Rect x={0} y={92} width={320} height={16} fill="url(#skyEdgeB)" />
      <Rect x={0} y={0} width={320} height={108} fill="url(#skyCornerVignette)" />
    </Svg>
  );
}
