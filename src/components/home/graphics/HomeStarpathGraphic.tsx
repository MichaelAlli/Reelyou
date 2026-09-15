import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';

import {
  DustStar,
  MilestoneNode,
  PinpointStar,
  PremiumStar,
} from '@/components/home/graphics/homeGraphicPrimitives';
import { HomeCopy } from '@/constants/homeCopy';
import { HomePalette } from '@/constants/homeLayout';

/** Left → right milestone anchors (viewBox 320 × 128). */
const NODES = [
  {
    x: 54,
    y: 86,
    r: 13,
    color: HomePalette.magenta,
    deep: HomePalette.purpleDeep,
    label: HomeCopy.starpathMilestones[0],
    id: 'sp0',
  },
  {
    x: 144,
    y: 72,
    r: 13,
    color: HomePalette.blue,
    deep: HomePalette.blueDeep,
    label: HomeCopy.starpathMilestones[1],
    id: 'sp1',
  },
  {
    x: 222,
    y: 58,
    r: 13,
    color: HomePalette.green,
    deep: HomePalette.greenDeep,
    label: HomeCopy.starpathMilestones[2],
    id: 'sp2',
  },
] as const;

const SUMMIT = { x: 296, y: 18 } as const;

/** Organic rising journey — passes through each milestone, brightens toward summit. */
const JOURNEY_PATH =
  'M 14 100 C 28 96 40 92 54 86 C 78 82 108 76 144 72 C 168 66 194 62 222 58 C 246 48 272 32 296 18';

const PATH_SPARKS = [
  { cx: 26, cy: 97, s: 0.42 },
  { cx: 68, cy: 84, s: 0.48 },
  { cx: 102, cy: 78, s: 0.44 },
  { cx: 168, cy: 68, s: 0.5 },
  { cx: 198, cy: 62, s: 0.46 },
  { cx: 248, cy: 44, s: 0.52 },
  { cx: 278, cy: 28, s: 0.56 },
] as const;

const SKY_DUST: Array<[number, number]> = [
  [18, 14], [44, 8], [92, 12], [128, 6], [176, 10], [236, 8], [268, 16],
];

function DisciplineIcon({ cx, cy }: { cx: number; cy: number }) {
  const ink = '#FFFEF8';
  return (
    <G>
      <Path
        d={`M ${cx - 5} ${cy + 4.5} V ${cy + 1.5} H ${cx - 2.5} V ${cy + 4.5} Z`}
        fill={ink}
        stroke={ink}
        strokeWidth={0.35}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${cx - 1.25} ${cy + 4.5} V ${cy - 1.5} H ${cx + 1.25} V ${cy + 4.5} Z`}
        fill={ink}
        stroke={ink}
        strokeWidth={0.35}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${cx + 2.5} ${cy + 4.5} V ${cy - 5} H ${cx + 5.5} V ${cy + 4.5} Z`}
        fill={ink}
        stroke={ink}
        strokeWidth={0.35}
        strokeLinejoin="round"
      />
      <Path
        d={`M ${cx - 5.5} ${cy + 5.5} H ${cx + 6}`}
        fill="none"
        stroke={ink}
        strokeWidth={0.75}
        opacity={0.62}
        strokeLinecap="round"
      />
    </G>
  );
}

function SkillsIcon({ cx, cy }: { cx: number; cy: number }) {
  const ink = '#FFFEF8';
  return (
    <G>
      <Circle cx={cx} cy={cy - 3.5} r={2.75} fill={ink} stroke={ink} strokeWidth={0.35} />
      <Path
        d={`M ${cx - 4.25} ${cy + 5.25} Q ${cx} ${cy + 1} ${cx + 4.25} ${cy + 5.25}`}
        fill="none"
        stroke={ink}
        strokeWidth={1.15}
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx + 3.25} ${cy - 0.75} L ${cx + 5.25} ${cy - 3.25} L ${cx + 4.75} ${cy - 0.25} Z`}
        fill={ink}
        stroke={ink}
        strokeWidth={0.3}
        strokeLinejoin="round"
      />
    </G>
  );
}

function ImpactIcon({ cx, cy }: { cx: number; cy: number }) {
  const ink = '#FFFEF8';
  return (
    <G>
      <Circle cx={cx} cy={cy} r={5.25} fill="none" stroke={ink} strokeWidth={1.05} />
      <Path
        d={`M ${cx} ${cy - 5.25} Q ${cx + 3.6} ${cy} ${cx} ${cy + 5.25} Q ${cx - 3.6} ${cy} ${cx} ${cy - 5.25}`}
        fill="none"
        stroke={ink}
        strokeWidth={0.85}
        opacity={0.88}
      />
      <Path
        d={`M ${cx - 5.25} ${cy} Q ${cx} ${cy - 2.4} ${cx + 5.25} ${cy}`}
        fill="none"
        stroke={ink}
        strokeWidth={0.85}
        opacity={0.88}
      />
      <Circle cx={cx + 1.75} cy={cy - 1.15} r={0.75} fill={ink} />
    </G>
  );
}

const NODE_ICONS = [DisciplineIcon, SkillsIcon, ImpactIcon] as const;

export function HomeStarpathGraphic() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 128" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="spBase" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.98} />
          <Stop offset="50%" stopColor="#0C0A20" stopOpacity={0.94} />
          <Stop offset="100%" stopColor="#100818" stopOpacity={0.96} />
        </LinearGradient>
        <LinearGradient id="spNebulaL" x1="0" y1="0" x2="1" y2="0.55">
          <Stop offset="0%" stopColor="#342060" stopOpacity={0.42} />
          <Stop offset="32%" stopColor="#281848" stopOpacity={0.26} />
          <Stop offset="62%" stopColor="#1A1230" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spBridge" x1="0" y1="0.5" x2="1" y2="0.5">
          <Stop offset="0%" stopColor="#281848" stopOpacity={0.12} />
          <Stop offset="48%" stopColor="#382038" stopOpacity={0.08} />
          <Stop offset="78%" stopColor="#503028" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spSunset" x1="1" y1="0" x2="0.35" y2="1">
          <Stop offset="0%" stopColor="#FFB060" stopOpacity={0.52} />
          <Stop offset="22%" stopColor="#E87840" stopOpacity={0.38} />
          <Stop offset="48%" stopColor="#C85848" stopOpacity={0.22} />
          <Stop offset="72%" stopColor="#482050" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spHorizon" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#E87848" stopOpacity={0.24} />
          <Stop offset="55%" stopColor="#682838" stopOpacity={0.16} />
          <Stop offset="100%" stopColor="#140810" stopOpacity={0.72} />
        </LinearGradient>
        <LinearGradient id="spPathGlow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#6A5018" stopOpacity={0.18} />
          <Stop offset="38%" stopColor="#D4AF37" stopOpacity={0.52} />
          <Stop offset="72%" stopColor="#FFF4D0" stopOpacity={0.78} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.92} />
        </LinearGradient>
        <LinearGradient id="spPathCore" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#9A7420" stopOpacity={0.65} />
          <Stop offset="42%" stopColor="#F5E6B8" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
        </LinearGradient>
        <RadialGradient id="spSummitBloom" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFEF8" stopOpacity={0.88} />
          <Stop offset="28%" stopColor="#FFF8DC" stopOpacity={0.32} />
          <Stop offset="62%" stopColor="#E8C872" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="#E8C872" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="spPeakLight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,248,220,0.18)" />
          <Stop offset="100%" stopColor="rgba(255,248,220,0)" />
        </LinearGradient>
        <LinearGradient id="spEdgeL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.88} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spEdgeR" x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.82} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spEdgeT" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.72} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="spEdgeB" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#0A0818" stopOpacity={0.78} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0} />
        </LinearGradient>
        <RadialGradient id="spCornerVignette" cx="50%" cy="50%" r="50%">
          <Stop offset="58%" stopColor="#0A0818" stopOpacity={0} />
          <Stop offset="100%" stopColor="#0A0818" stopOpacity={0.42} />
        </RadialGradient>
      </Defs>

      {/* Layered atmospheric depth */}
      <Path d="M0 128 L0 0 L320 0 L320 128 Z" fill="url(#spBase)" />
      <Path d="M0 128 L0 0 L320 0 L320 128 Z" fill="url(#spNebulaL)" />
      <Path d="M0 128 L0 0 L320 0 L320 128 Z" fill="url(#spBridge)" />
      <Path d="M160 0 L320 0 L320 128 L200 128 Z" fill="url(#spSunset)" opacity={0.62} />
      <Path d="M180 52 L320 52 L320 128 L180 128 Z" fill="url(#spHorizon)" opacity={0.52} />

      {SKY_DUST.map(([x, y], i) => (
        <DustStar key={`dust-${i}`} cx={x} cy={y} opacity={0.32 + (i % 3) * 0.08} size={0.55} />
      ))}

      {/* Distant ridge — mid-ground */}
      <Path
        d="M0 92 L36 78 L72 86 L108 74 L148 82 L188 70 L228 78 L262 66 L296 58 L320 52 L320 128 L0 128 Z"
        fill="rgba(8,6,18,0.58)"
      />

      {/* Primary mountain mass — cinematic summit silhouette */}
      <Path
        d="M0 102 L28 88 L58 94 L92 80 L128 90 L168 76 L204 86 L244 72 L278 64 L296 48 L320 42 L320 128 L0 128 Z"
        fill="rgba(4,3,12,0.94)"
      />

      {/* Summit face — warm edge light */}
      <Path
        d="M244 72 L278 64 L296 48 L320 42 L320 58 L296 68 L278 76 Z"
        fill="url(#spPeakLight)"
      />
      <Path
        d="M278 64 L296 48 L320 42"
        fill="none"
        stroke="rgba(255,248,220,0.28)"
        strokeWidth={0.65}
        strokeLinecap="round"
      />

      {/* Luminous path climbing the summit face */}
      <Path
        d="M222 58 C246 48 272 32 296 18"
        stroke="rgba(255,252,248,0.14)"
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.45}
      />
      <Path
        d="M222 58 C246 48 272 32 296 18"
        stroke="rgba(255,248,220,0.42)"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="3 5"
      />

      {/* Golden journey path — layered glow + core */}
      <Path
        d={JOURNEY_PATH}
        stroke="rgba(255,252,248,0.08)"
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        opacity={0.4}
      />
      <Path
        d={JOURNEY_PATH}
        stroke="url(#spPathGlow)"
        strokeWidth={5.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.62}
      />
      <Path
        d={JOURNEY_PATH}
        stroke="url(#spPathCore)"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />

      {PATH_SPARKS.map((s, i) => (
        <PinpointStar
          key={`spark-${i}`}
          cx={s.cx}
          cy={s.cy}
          color="#FFF8DC"
          opacity={0.72 + (i % 2) * 0.12}
          size={s.s}
        />
      ))}

      {/* Milestone nodes */}
      {NODES.map((node, i) => {
        const Icon = NODE_ICONS[i];
        return (
          <G key={node.id}>
            <MilestoneNode
              cx={node.x}
              cy={node.y}
              r={node.r}
              color={node.color}
              deep={node.deep}
              id={node.id}
            >
              <Icon cx={node.x} cy={node.y} />
            </MilestoneNode>
            <Text
              x={node.x}
              y={114}
              fill="rgba(252,251,248,0.94)"
              fontSize={7.2}
              fontWeight="600"
              textAnchor="middle"
            >
              {node.label}
            </Text>
          </G>
        );
      })}

      {/* Summit destination — crisp star with controlled glow */}
      <Circle cx={SUMMIT.x} cy={SUMMIT.y + 3} r={20} fill="url(#spSummitBloom)" opacity={0.32} />
      <PremiumStar
        cx={SUMMIT.x}
        cy={SUMMIT.y}
        size={10.5}
        color={HomePalette.goldBright}
        id="spSummitStar"
        intensity={1.12}
      />
      <Circle cx={SUMMIT.x} cy={SUMMIT.y} r={2.15} fill="#FFFFFF" opacity={0.98} />

      {/* Edge vignette — blend artwork into card surface */}
      <Rect x={0} y={0} width={44} height={128} fill="url(#spEdgeL)" />
      <Rect x={276} y={0} width={44} height={128} fill="url(#spEdgeR)" />
      <Rect x={0} y={0} width={320} height={28} fill="url(#spEdgeT)" />
      <Rect x={0} y={104} width={320} height={24} fill="url(#spEdgeB)" />
      <Rect x={0} y={0} width={320} height={128} fill="url(#spCornerVignette)" />
    </Svg>
  );
}
