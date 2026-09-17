/**
 * REELYOU Beta MVP — locked celestial motion timings.
 * Subtle twinkle / breathing / arrival / shooting-star flight.
 */

export const CelestialStarBreathMotion = {
  durationMs: 3200,
  opacityBase: 0.9,
  opacityRange: 0.1,
} as const;

export const CelestialArrivalMotion = {
  trailFadeDelayMs: 600,
  trailFadeDurationMs: 1400,
  linksRevealDurationMs: 500,
  linksInitialOpacity: 0.68,
  linksFadeDelayMs: 1200,
  linksFadeDurationMs: 1600,
  starBreathDelayMs: 800,
} as const;

export const CelestialConstellationRevealMotion = {
  revealDurationMs: 600,
  fadeDurationMs: 1800,
  revealOpacity: 0.55,
} as const;

export const CelestialShootingStarFlightMotion = {
  totalDurationMs: 3000,
  flightDurationMs: 2400,
  flightDelayMs: 220,
  destGlowDelayMs: 2200,
  sceneFadeDelayMs: 2400,
} as const;

export const CelestialStarPulseMotion = {
  initialPulseCount: 3,
  initialPulseDurationMs: 1100,
  restingPulseDurationMs: 2200,
} as const;
