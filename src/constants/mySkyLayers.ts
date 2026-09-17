import type { MySkyLayerId } from '@/mySky/skyLayers';

/** User-facing layer labels — calm, non-technical. */
export const MY_SKY_LAYER_LABELS: Record<MySkyLayerId, string> = {
  stars: 'Stars',
  constellations: 'Constellations',
  communities: 'Communities',
  connections: 'Connections',
  growth: 'Growth',
  impact: 'Impact',
  guidance: 'Guidance',
  temporal: 'History',
};

/** Layers shown in the control strip — order matters for mobile scroll. */
export const MY_SKY_LAYER_CONTROL_ORDER: MySkyLayerId[] = [
  'stars',
  'constellations',
  'communities',
  'connections',
  'growth',
  'impact',
  'guidance',
  'temporal',
];

/** Constellations use temporary reveal — not a sticky toggle. */
export const MY_SKY_TEMPORARY_REVEAL_LAYERS: ReadonlySet<MySkyLayerId> = new Set(['constellations']);

export const MySkyLayerCopy = {
  controlsHint: 'Reveal deeper layers of your sky.',
  constellationRevealHint: 'Tap Constellations for a gentle glimpse — lines fade away.',
} as const;
