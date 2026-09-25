import type { EmergingConstellation } from '@/emergingConstellations/emergingConstellationTypes';
import { isEmergenceCredible } from '@/emergingConstellations/emergingConstellationRubric';

/** Dev-only credible constellation — not shown unless demo flag enabled. */
export const DEV_EMERGING_CONSTELLATION_ID = 'dev-constellation-career-transition';

export const DEV_EMERGING_CONSTELLATION: EmergingConstellation = {
  id: DEV_EMERGING_CONSTELLATION_ID,
  name: 'Career Transition',
  description:
    'A place for people navigating career change to share perspective, encourage one another, and move forward together.',
  sharedTheme: 'People growing through similar things may be beginning to find one another.',
  primaryThemes: ['direction', 'courage', 'next steps'],
  relatedSkyAreaIds: ['career', 'growth'],
  emergenceEvidenceIds: ['evidence-career-patterns-1', 'evidence-like-hearted-affinity-1'],
  status: 'forming',
  aiSuggested: true,
  humanExplanation:
    'Your Guide noticed a theme that may be showing up around direction, courage, and next steps — a possibility worth exploring, not a label.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  signals: {
    likeHeartedness: 0.88,
    sharedSkyAreas: 0.55,
    repeatedPatterns: 0.62,
    compatibleNeeds: 0.5,
    livedExperience: 0.46,
    contributionBehavior: 0.4,
    starPathAlignment: 0.35,
    hashtagContext: 0.1,
  },
};

export function devEmergingConstellationIfEligible(): EmergingConstellation | null {
  if (!isEmergenceCredible(DEV_EMERGING_CONSTELLATION.signals)) return null;
  return DEV_EMERGING_CONSTELLATION;
}

export function resolveEmergingConstellationById(
  constellationId?: string | null,
): EmergingConstellation | null {
  const dev = devEmergingConstellationIfEligible();
  if (!dev) return null;
  if (constellationId && constellationId !== dev.id) return null;
  return dev;
}
