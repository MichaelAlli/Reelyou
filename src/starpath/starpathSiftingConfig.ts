import type { StarPathInteractionType } from '@/starpath/starpathInteractionTypes';

export const STARPATH_SIFTING_ENGINE_VERSION = 'beta-v1';

/** Internal Beta weights — not exposed in UI. */
export const INTERACTION_WEIGHTS: Record<StarPathInteractionType, number> = {
  selected: 1.0,
  interested: 0.9,
  saved: 0.75,
  explored: 0.45,
  viewed: 0.1,
  dismissed: -1.0,
};

/** Half-life in ms; null = durable (minimal decay for authoritative explicit choice). */
export const RECENCY_HALF_LIFE_MS: Record<StarPathInteractionType, number | null> = {
  selected: null,
  interested: null,
  saved: null,
  dismissed: null,
  explored: 7 * 24 * 60 * 60 * 1000,
  viewed: 2 * 24 * 60 * 60 * 1000,
};

export const EXPLICIT_INTERACTION_TYPES: StarPathInteractionType[] = [
  'selected',
  'interested',
  'saved',
  'dismissed',
];

export const POSITIVE_EXPLICIT_TYPES: StarPathInteractionType[] = ['selected', 'interested', 'saved'];

/** Internal band thresholds (normalized score). */
export const RELEVANCE_BAND_THRESHOLDS = {
  suppressedMax: -0.35,
  lowMax: 0.12,
  normalMax: 0.38,
  elevatedMax: 0.62,
} as const;

export const DENSITY_GUARDRAILS = {
  maxActiveNearbyNodes: 12,
  maxElevatedNodes: 5,
  maxEmergenceCandidates: 4,
  emergenceMinEligibilityScore: 0.42,
  emergenceCooldownMs: 24 * 60 * 60 * 1000,
} as const;

export const STABILITY_RULES = {
  minScoreDeltaForBandChange: 0.08,
  maxPassiveContributionPerNode: 0.32,
  branchAffinityBoostCap: 0.18,
  themeEngagementThreshold: 2,
  explicitBypassesHysteresis: true,
} as const;

export const SIGNAL_HISTORY_MAX = 400;
