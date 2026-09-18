/**
 * REELYOU Beta MVP — locked celestial visual tokens.
 * Approved My Sky star / effect language — reuse across all sky features.
 */

/** Deep navy / indigo / violet sky atmosphere. */
export const CelestialSkyAtmosphere = {
  base: '#05070A',
  tint: 'rgba(6, 8, 28, 0.42)',
  dimOverlay: 'rgba(4, 6, 18, 0.18)',
  nebulaTop: '#7B4FD4',
  nebulaMid: '#3D2A6B',
  horizonGlow: '#FFB347',
  arrivalVeil: '#1A1538',
} as const;

/** Gold / white / lavender / blue-white star palette. */
export const CelestialPalette = {
  warmWhite: '#FFFEF8',
  warmWhiteCore: '#FFFFFF',
  skywriteGold: '#FFD57A',
  guidanceGold: '#FFF4D6',
  sparkGold: '#FFF8E7',
  trailOrange: '#FF9F43',
  impactGold: '#FFB347',
  homeGold: '#E8C872',
  homeGoldBright: '#F5E6B8',
  lavender: '#C4A8FF',
  lavenderTrail: 'rgba(196, 168, 255, 0.35)',
  reflection: '#C4A8FF',
  community: '#5EEAD4',
  relationship: '#E879A8',
  growth: '#8FD4FF',
  guidance: '#FFF4D6',
} as const;

/** Node-type color families — data-driven sky growth. */
export const CelestialNodeColors = {
  skywrite: CelestialPalette.skywriteGold,
  reflection: CelestialPalette.reflection,
  community: CelestialPalette.community,
  relationship: CelestialPalette.relationship,
  growth: CelestialPalette.growth,
  impact: CelestialPalette.impactGold,
  guidance: CelestialPalette.guidance,
  identity: CelestialPalette.skywriteGold,
} as const;

export type CelestialColorFamily = keyof typeof CelestialNodeColors;

/** Configurable star visual props for AI / user-driven sky growth. */
export interface CelestialStarVisualProps {
  size?: number;
  brightness?: number;
  glow?: number;
  colorFamily?: CelestialColorFamily | string;
  twinkle?: boolean;
  emphasis?: number;
  arrivalState?: 'resting' | 'arriving' | 'landed';
}

/** Constellation link stroke presets — warm gold family. */
export const CelestialConstellationStroke = {
  ambient: { stroke: 'rgba(245, 230, 184, 0.18)', strokeWidth: 0.35 },
  homeSubtle: { stroke: 'rgba(245, 230, 184, 0.14)', strokeWidth: 0.35 },
  homeFaint: { stroke: 'rgba(245, 230, 184, 0.11)', strokeWidth: 0.35 },
  pattern: { stroke: 'rgba(245, 230, 184, 0.45)', strokeWidth: 1.2 },
  display: { strokeWidth: 1.4, strokeOpacity: 0.62 },
} as const;

/** Shooting-star trail gradient + glow — locked approved treatment. */
export const CelestialShootingStarTrail = {
  glowStroke: 'rgba(255, 180, 80, 0.22)',
  glowStrokeWidth: 14,
  coreStrokeWidth: 3.5,
  flightMidGlow: 'rgba(255, 230, 160, 0.32)',
  flightMidGlowWidth: 9,
  gradientStops: {
    settled: [
      { offset: '0%', color: CelestialPalette.trailOrange, opacity: 0.15 },
      { offset: '35%', color: CelestialPalette.skywriteGold, opacity: 0.85 },
      { offset: '70%', color: CelestialPalette.sparkGold, opacity: 0.95 },
      { offset: '100%', color: CelestialPalette.warmWhiteCore, opacity: 0.75 },
    ],
    flight: [
      { offset: '0%', color: CelestialPalette.trailOrange, opacity: 0.08 },
      { offset: '35%', color: CelestialPalette.skywriteGold, opacity: 0.85 },
      { offset: '75%', color: CelestialPalette.sparkGold, opacity: 0.95 },
      { offset: '100%', color: CelestialPalette.warmWhiteCore, opacity: 0.7 },
    ],
  },
  sparkColors: [CelestialPalette.skywriteGold, CelestialPalette.sparkGold] as const,
  sparkCount: { settled: 12, flight: 8 },
} as const;

/** Star bloom / halo / landing pulse — approved hierarchy. */
export const CelestialStarBloom = {
  flying: {
    size: 28,
    color: CelestialPalette.guidanceGold,
    bloom: 'rgba(255, 213, 122, 0.28)',
    halo: 'rgba(255, 213, 122, 0.15)',
    haloBorder: 'rgba(255, 213, 122, 0.28)',
  },
  destination: {
    size: 20,
    color: CelestialPalette.skywriteGold,
    halo: 'rgba(255, 213, 122, 0.2)',
    haloBorder: 'rgba(255, 213, 122, 0.45)',
  },
  landingPulse: {
    border: 'rgba(255, 213, 122, 0.35)',
    fill: 'rgba(255, 213, 122, 0.06)',
    ring: 'rgba(255, 213, 122, 0.55)',
    ringFill: 'rgba(255, 213, 122, 0.08)',
  },
  highlightGlow: { radius: 28, opacity: 0.18 },
} as const;

/** Premium star glow math — preserve exact approved ratios. */
export const CelestialStarGeometry = {
  fourPointInnerRatio: 0.26,
  fourPointCompactInnerRatio: 0.22,
  premiumInnerRatio: 0.28,
  premiumHaloRatio: 2.2,
  premiumHaloIntensityBoost: 0.25,
  premiumCrossRayOpacity: 0.18,
  fourPointCrossRayOpacity: 0.14,
  userStarPremiumThreshold: 6.5,
  defaultUserStarSize: 5.2,
} as const;
