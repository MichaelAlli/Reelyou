import Svg, { Circle, Line, Path } from 'react-native-svg';

import { HomePalette } from '@/constants/homeLayout';

const GOLD = HomePalette.gold;

export function HomeMenuIcon({ size = 18 }: { size?: number }) {
  const s = size / 18;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Line x1={3} y1={5} x2={15} y2={5} stroke={GOLD} strokeWidth={1.4 * s} strokeLinecap="round" />
      <Line x1={3} y1={9} x2={15} y2={9} stroke={GOLD} strokeWidth={1.4 * s} strokeLinecap="round" />
      <Line x1={3} y1={13} x2={15} y2={13} stroke={GOLD} strokeWidth={1.4 * s} strokeLinecap="round" />
    </Svg>
  );
}

export function HomeBellIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M9 2.5 C6.2 2.5 4.5 4.6 4.5 7.2 V10.5 L3 12.5 H15 L13.5 10.5 V7.2 C13.5 4.6 11.8 2.5 9 2.5 Z"
        fill="none"
        stroke="rgba(252, 251, 248, 0.92)"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <Path
        d="M7.2 14 C7.5 15 8.2 15.8 9 15.8 C9.8 15.8 10.5 15 10.8 14"
        fill="none"
        stroke="rgba(252, 251, 248, 0.88)"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <Circle cx={9} cy={3.2} r={0.55} fill={GOLD} opacity={0.75} />
    </Svg>
  );
}

export function HomeFeatherIcon({ size = 18 }: { size?: number }) {
  const s = size / 18;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M13.2 2.8 C10.4 2.8 7.6 4.8 6.2 7.6 C8.1 6.8 10.2 6.9 11.8 7.8 C12.6 5.8 13 4 13.2 2.8 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.25 * s}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M6.2 7.6 C5.2 9.8 4.6 12.2 4.2 14.8"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.15 * s}
        strokeLinecap="round"
      />
      <Path
        d="M6.2 7.6 L14.6 13.2"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.05 * s}
        strokeLinecap="round"
      />
      <Line
        x1={7.4}
        y1={8.4}
        x2={10.2}
        y2={10.6}
        stroke={GOLD}
        strokeWidth={0.75 * s}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Line
        x1={8.2}
        y1={6.8}
        x2={11.4}
        y2={8.8}
        stroke={GOLD}
        strokeWidth={0.65 * s}
        strokeLinecap="round"
        opacity={0.45}
      />
      <Circle cx={12.8} cy={4.2} r={0.45 * s} fill={HomePalette.goldBright} opacity={0.85} />
    </Svg>
  );
}

export function HomeSendIcon({ size = 16 }: { size?: number }) {
  const s = size / 16;
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M 2.5 13 L 13.5 2.5 L 8.25 8.25 L 2.5 13 Z"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.2 * s}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M 8.25 8.25 L 13.5 2.5"
        fill="none"
        stroke={GOLD}
        strokeWidth={0.85 * s}
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
}

export function HomeFocusIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={6.5} fill="none" stroke={HomePalette.purple} strokeWidth={1.3} />
      <Circle cx={10} cy={10} r={2.2} fill={HomePalette.purple} opacity={0.85} />
      <Line x1={10} y1={2} x2={10} y2={5} stroke={HomePalette.purple} strokeWidth={1.1} strokeLinecap="round" />
      <Line x1={10} y1={15} x2={10} y2={18} stroke={HomePalette.purple} strokeWidth={1.1} strokeLinecap="round" />
      <Line x1={2} y1={10} x2={5} y2={10} stroke={HomePalette.purple} strokeWidth={1.1} strokeLinecap="round" />
      <Line x1={15} y1={10} x2={18} y2={10} stroke={HomePalette.purple} strokeWidth={1.1} strokeLinecap="round" />
    </Svg>
  );
}

export function HomeSparkleIcon({ size = 14, color = GOLD }: { size?: number; color?: string }) {
  const r = size / 2;
  const inner = r * 0.26;
  const cx = size / 2;
  const cy = size / 2;
  const d = `
    M ${cx} ${cy - r}
    L ${cx + inner} ${cy - inner}
    L ${cx + r} ${cy}
    L ${cx + inner} ${cy + inner}
    L ${cx} ${cy + r}
    L ${cx - inner} ${cy + inner}
    L ${cx - r} ${cy}
    L ${cx - inner} ${cy - inner}
    Z
  `;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r * 0.95} fill={color} opacity={0.14} />
      <Path d={d} fill={color} />
      <Circle cx={cx} cy={cy} r={Math.max(0.45, r * 0.14)} fill="#FFFEF8" opacity={0.92} />
    </Svg>
  );
}
