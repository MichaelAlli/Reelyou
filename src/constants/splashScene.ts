/**
 * Layout + scene data calibrated against the approved REELYOU splash mockup (9:16).
 * All positions are screen-ratio based — no hardcoded pixel placement.
 */
export const SPLASH_RING = {
  cx: 0.5,
  cy: 0.358,
  rx: 0.335,
  ry: 0.268,
  /** Ring star index for the hero flare (~10 o'clock on the oval). */
  heroIndex: 8,
} as const;

export const SPLASH_LAYOUT = {
  /** Vertical center of logo stack — slightly below ring center for R breathing room. */
  brandCenterY: SPLASH_RING.cy + 0.014,
  brandBlockHalfRatio: 0.112,
  brandTopPadding: 20,
  loadingBottomRatio: 0.138,
  loadingStackGapRatio: 0.011,
} as const;

/** Deterministic pseudo-random for stable star placement across builds. */
const pr = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

export interface SceneStar {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  peak: number;
  tint: string;
  sparkle?: boolean;
}

export interface RingStar {
  id: string;
  x: number;
  y: number;
  size: number;
  isHero?: boolean;
}

export interface CloudPuff {
  ox: number;
  oy: number;
  scale: number;
}

export interface CloudLayerSpec {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  puffs: CloudPuff[];
}

export const SPLASH_STAR_COUNT = 280;

export const SPLASH_STAR_FIELD: SceneStar[] = Array.from({ length: SPLASH_STAR_COUNT }, (_, i) => {
  const inRing = pr(i * 2.17) > 0.28;
  let x: number;
  let y: number;

  if (inRing) {
    const angle = pr(i * 4.31) * Math.PI * 2;
    const radius = Math.sqrt(pr(i * 6.73)) * 0.94;
    x = SPLASH_RING.cx + Math.cos(angle) * SPLASH_RING.rx * radius;
    y = SPLASH_RING.cy + Math.sin(angle) * SPLASH_RING.ry * radius;
  } else {
    x = pr(i * 3.17 + 1);
    y = pr(i * 5.91 + 2) * 0.5;
  }

  const blueTint = pr(i * 9.41) > 0.68;

  return {
    id: `sf${i}`,
    x,
    y,
    size: 1 + Math.floor(pr(i * 7.13) * 2.8),
    delay: Math.floor(pr(i * 11.07) * 6200),
    duration: 2400 + Math.floor(pr(i * 13.31) * 3600),
    peak: 0.12 + pr(i * 17.89) * 0.88,
    tint: blueTint ? 'rgba(195, 215, 255, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    sparkle: pr(i * 19.03) > 0.935,
  };
});

const RING_COUNT = 52;

export const SPLASH_RING_STARS: RingStar[] = Array.from({ length: RING_COUNT }, (_, i) => {
  const angle = (i / RING_COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    id: `ring${i}`,
    x: SPLASH_RING.cx + Math.cos(angle) * SPLASH_RING.rx,
    y: SPLASH_RING.cy + Math.sin(angle) * SPLASH_RING.ry,
    size: i % 4 === 0 ? 3 : 2,
    isHero: i === SPLASH_RING.heroIndex,
  };
});

const puff = (ox: number, oy: number, scale: number): CloudPuff => ({ ox, oy, scale });

export const SPLASH_CLOUD_LAYERS: CloudLayerSpec[] = [
  {
    id: 'cloud-outer-left',
    left: -0.22,
    top: 0.4,
    width: 0.82,
    height: 0.22,
    opacity: 0.62,
    driftX: 12,
    driftY: -5,
    duration: 56000,
    delay: 0,
    puffs: [
      puff(0, 0.14, 1.08),
      puff(0.16, 0.05, 0.98),
      puff(0.34, 0.1, 1.12),
      puff(0.52, 0.03, 0.92),
      puff(0.7, 0.12, 0.86),
      puff(0.88, 0.06, 0.78),
    ],
  },
  {
    id: 'cloud-outer-right',
    left: 0.4,
    top: 0.41,
    width: 0.8,
    height: 0.21,
    opacity: 0.6,
    driftX: -11,
    driftY: -5,
    duration: 52000,
    delay: 700,
    puffs: [
      puff(0.02, 0.12, 1.05),
      puff(0.2, 0.04, 0.96),
      puff(0.38, 0.09, 1.08),
      puff(0.56, 0.02, 0.9),
      puff(0.74, 0.11, 0.84),
      puff(0.9, 0.05, 0.76),
    ],
  },
  {
    id: 'cloud-mid-left',
    left: -0.08,
    top: 0.48,
    width: 0.56,
    height: 0.17,
    opacity: 0.72,
    driftX: 18,
    driftY: -7,
    duration: 42000,
    delay: 350,
    puffs: [puff(0, 0.1, 1), puff(0.26, 0.02, 0.94), puff(0.52, 0.11, 0.9), puff(0.76, 0.04, 0.82)],
  },
  {
    id: 'cloud-mid-right',
    left: 0.54,
    top: 0.49,
    width: 0.54,
    height: 0.16,
    opacity: 0.7,
    driftX: -16,
    driftY: -6,
    duration: 44000,
    delay: 1000,
    puffs: [puff(0.06, 0.08, 1), puff(0.3, 0, 0.92), puff(0.54, 0.1, 0.94), puff(0.78, 0.03, 0.8)],
  },
  {
    id: 'cloud-inner-left',
    left: 0.04,
    top: 0.54,
    width: 0.4,
    height: 0.13,
    opacity: 0.5,
    driftX: 9,
    driftY: -3,
    duration: 36000,
    delay: 550,
    puffs: [puff(0, 0.02, 1), puff(0.32, 0.09, 0.88), puff(0.65, 0.04, 0.86)],
  },
  {
    id: 'cloud-inner-right',
    left: 0.56,
    top: 0.55,
    width: 0.38,
    height: 0.12,
    opacity: 0.48,
    driftX: -8,
    driftY: -3,
    duration: 38000,
    delay: 850,
    puffs: [puff(0.04, 0.06, 1), puff(0.36, 0, 0.9), puff(0.68, 0.08, 0.84)],
  },
];

export interface MountainPeak {
  id: string;
  left: number;
  width: number;
  height: number;
  color: string;
}

export const SPLASH_MOUNTAIN_PEAKS: MountainPeak[] = [
  { id: 'm1', left: -0.06, width: 0.2, height: 0.12, color: 'rgba(6, 8, 22, 0.97)' },
  { id: 'm2', left: 0.08, width: 0.16, height: 0.16, color: 'rgba(4, 6, 18, 0.99)' },
  { id: 'm3', left: 0.2, width: 0.14, height: 0.13, color: 'rgba(8, 10, 26, 0.95)' },
  { id: 'm4', left: 0.36, width: 0.12, height: 0.07, color: 'rgba(5, 7, 20, 0.96)' },
  { id: 'm5', left: 0.5, width: 0.12, height: 0.07, color: 'rgba(5, 7, 20, 0.96)' },
  { id: 'm6', left: 0.62, width: 0.15, height: 0.14, color: 'rgba(6, 8, 22, 0.98)' },
  { id: 'm7', left: 0.74, width: 0.18, height: 0.12, color: 'rgba(7, 9, 24, 0.94)' },
  { id: 'm8', left: 0.88, width: 0.18, height: 0.1, color: 'rgba(3, 5, 16, 0.99)' },
];

export const SPLASH_SUNRISE = {
  horizonBottomRatio: 0.155,
  coreBottomRatio: 0.175,
  coreSizeRatio: 0.14,
  innerSizeRatio: 0.07,
} as const;
