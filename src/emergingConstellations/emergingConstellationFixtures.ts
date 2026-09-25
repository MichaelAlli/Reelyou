import type { EmergingConstellation } from '@/emergingConstellations/emergingConstellationTypes';
import { isEmergenceCredible } from '@/emergingConstellations/emergingConstellationRubric';

/** Dev-only credible constellation — not shown unless demo flag enabled. */
export const DEV_EMERGING_CONSTELLATION: EmergingConstellation = {
  id: 'dev-constellation-career-transition',
  name: 'Career Transition',
  sharedTheme: 'People growing through similar things may be beginning to find one another.',
  relatedSkyAreaIds: ['career', 'growth'],
  status: 'forming',
  aiSuggested: true,
  humanExplanation:
    'Your Guide noticed repeated meaningful patterns around direction, courage, and next steps — not a label, just a possibility worth exploring.',
  createdAt: Date.now(),
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
