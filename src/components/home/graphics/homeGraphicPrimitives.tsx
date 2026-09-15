import type { ReactNode } from 'react';
import { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

export function PinpointStar({
  cx,
  cy,
  color = '#FFFEF8',
  opacity = 0.85,
  size = 0.45,
}: {
  cx: number;
  cy: number;
  color?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <G opacity={opacity}>
      <Circle cx={cx} cy={cy} r={size * 2.5} fill={color} opacity={0.1} />
      <Circle cx={cx} cy={cy} r={size} fill={color} />
    </G>
  );
}

export function FourPointStar({
  cx,
  cy,
  size,
  color,
  id,
  opacity = 1,
  rotation = 0,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  id: string;
  opacity?: number;
  rotation?: number;
}) {
  const inner = size * 0.26;
  const starPath = `
    M ${cx} ${cy - size}
    L ${cx + inner} ${cy - inner}
    L ${cx + size} ${cy}
    L ${cx + inner} ${cy + inner}
    L ${cx} ${cy + size}
    L ${cx - inner} ${cy + inner}
    L ${cx - size} ${cy}
    L ${cx - inner} ${cy - inner}
    Z
  `;

  const rotateTransform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

  return (
    <G opacity={opacity} transform={rotateTransform}>
      <Defs>
        <RadialGradient id={`${id}-4`} cx="38%" cy="30%" r="72%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="40%" stopColor={color} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.65} />
        </RadialGradient>
      </Defs>
      <Line x1={cx - size * 1.4} y1={cy} x2={cx + size * 1.4} y2={cy} stroke="#FFFEF8" strokeWidth={0.32} opacity={0.14} strokeLinecap="round" />
      <Line x1={cx} y1={cy - size * 1.4} x2={cx} y2={cy + size * 1.4} stroke="#FFFEF8" strokeWidth={0.32} opacity={0.14} strokeLinecap="round" />
      <Path d={starPath} fill={`url(#${id}-4)`} />
      <Circle cx={cx} cy={cy} r={Math.max(0.4, size * 0.14)} fill="#FFFFFF" opacity={0.96} />
    </G>
  );
}

export function SixPointSparkle({
  cx,
  cy,
  size,
  color,
  id,
  opacity = 0.7,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  id: string;
  opacity?: number;
}) {
  const rays = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const len = size * 1.35;
    return { x2: cx + Math.cos(angle) * len, y2: cy + Math.sin(angle) * len };
  });

  return (
    <G opacity={opacity}>
      <Defs>
        <RadialGradient id={`${id}-6`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.92} />
          <Stop offset="55%" stopColor={color} stopOpacity={0.5} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {rays.map((ray, i) => (
        <Line key={`${id}-r${i}`} x1={cx} y1={cy} x2={ray.x2} y2={ray.y2} stroke={color} strokeWidth={0.25} strokeLinecap="round" opacity={0.38} />
      ))}
      <Circle cx={cx} cy={cy} r={size * 0.5} fill={`url(#${id}-6)`} />
    </G>
  );
}

export function PremiumStar({
  cx,
  cy,
  size,
  color,
  id,
  intensity = 1,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  id: string;
  intensity?: number;
}) {
  const inner = size * 0.28;
  const starPath = `
    M ${cx} ${cy - size}
    L ${cx + inner} ${cy - inner}
    L ${cx + size} ${cy}
    L ${cx + inner} ${cy + inner}
    L ${cx} ${cy + size}
    L ${cx - inner} ${cy + inner}
    L ${cx - size} ${cy}
    L ${cx - inner} ${cy - inner}
    Z
  `;
  const halo = size * (2.2 + intensity * 0.25);

  return (
    <G>
      <Defs>
        <RadialGradient id={`${id}-h`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.36 * intensity} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}-c`} cx="40%" cy="34%" r="70%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="35%" stopColor="#FFFEF8" stopOpacity={0.98} />
          <Stop offset="62%" stopColor={color} stopOpacity={0.94} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.68} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={halo} fill={`url(#${id}-h)`} />
      <Line x1={cx - size * 1.5} y1={cy} x2={cx + size * 1.5} y2={cy} stroke="#FFFEF8" strokeWidth={0.4} opacity={0.18 * intensity} strokeLinecap="round" />
      <Line x1={cx} y1={cy - size * 1.5} x2={cx} y2={cy + size * 1.5} stroke="#FFFEF8" strokeWidth={0.4} opacity={0.18 * intensity} strokeLinecap="round" />
      <Path d={starPath} fill={`url(#${id}-c)`} />
      <Circle cx={cx} cy={cy} r={Math.max(0.55, size * 0.16)} fill="#FFFFFF" opacity={0.98} />
    </G>
  );
}

export function ConstellationLink({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <Line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="rgba(245, 230, 184, 0.18)"
      strokeWidth={0.35}
      strokeLinecap="round"
    />
  );
}

/** Reference-style circular milestone node with colored ring glow. */
export function MilestoneNode({
  cx,
  cy,
  r,
  color,
  deep,
  id,
  children,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  deep: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <G>
      <Defs>
        <RadialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
          <Stop offset="55%" stopColor={color} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}-fill`} cx="34%" cy="28%" r="76%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset="18%" stopColor="#FFFEF8" stopOpacity={0.97} />
          <Stop offset="50%" stopColor={color} stopOpacity={0.98} />
          <Stop offset="100%" stopColor={deep} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r + 14} fill={`url(#${id}-glow)`} />
      <Circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={color} strokeWidth={1.1} opacity={0.65} />
      <Circle cx={cx} cy={cy} r={r + 1.2} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={0.55} />
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id}-fill)`} stroke="rgba(255,255,255,0.38)" strokeWidth={0.5} />
      <Circle cx={cx - r * 0.22} cy={cy - r * 0.28} r={r * 0.22} fill="#FFFFFF" opacity={0.38} />
      {children}
    </G>
  );
}

export const MilestoneMarker = MilestoneNode;
export const MilestoneOrb = MilestoneNode;
export const LuminousStar = PremiumStar;

export function DustStar({
  cx,
  cy,
  opacity = 0.4,
  size = 0.65,
  color = '#C4A8FF',
}: {
  cx: number;
  cy: number;
  opacity?: number;
  size?: number;
  color?: string;
}) {
  return (
    <G opacity={opacity}>
      <Circle cx={cx} cy={cy} r={size * 2} fill={color} opacity={0.14} />
      <Circle cx={cx} cy={cy} r={size * 0.48} fill="#FFFFFF" opacity={0.88} />
    </G>
  );
}
