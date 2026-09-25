import type { EmergingConstellationSignals } from '@/emergingConstellations/emergingConstellationTypes';

/** Locked priority weights — like-heartedness highest, hashtags lowest. */
export const RUBRIC_WEIGHTS = {
  likeHeartedness: 1.0,
  sharedSkyAreas: 0.62,
  repeatedPatterns: 0.48,
  compatibleNeeds: 0.44,
  livedExperience: 0.44,
  contributionBehavior: 0.36,
  starPathAlignment: 0.28,
  hashtagContext: 0.12,
} as const;

export function scoreEmergingConstellation(signals: EmergingConstellationSignals): number {
  return (
    signals.likeHeartedness * RUBRIC_WEIGHTS.likeHeartedness +
    signals.sharedSkyAreas * RUBRIC_WEIGHTS.sharedSkyAreas +
    signals.repeatedPatterns * RUBRIC_WEIGHTS.repeatedPatterns +
    signals.compatibleNeeds * RUBRIC_WEIGHTS.compatibleNeeds +
    signals.livedExperience * RUBRIC_WEIGHTS.livedExperience +
    signals.contributionBehavior * RUBRIC_WEIGHTS.contributionBehavior +
    signals.starPathAlignment * RUBRIC_WEIGHTS.starPathAlignment +
    signals.hashtagContext * RUBRIC_WEIGHTS.hashtagContext
  );
}

/** Minimum internal score before a suggestion may surface (not shown to users). */
export const EMERGENCE_CREDIBLE_THRESHOLD = 0.72;

export function isEmergenceCredible(signals: EmergingConstellationSignals): boolean {
  return scoreEmergingConstellation(signals) >= EMERGENCE_CREDIBLE_THRESHOLD;
}
