export const STARPATH_GUIDANCE_VERSION = 'beta-v1';

export const GUIDANCE_STABILITY = {
  passiveStabilityMs: 12_000,
  savedRevisitMinAgeMs: 60_000,
  snoozeDurationMs: 30 * 60 * 1000,
} as const;
