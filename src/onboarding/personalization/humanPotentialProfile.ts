import type { NorthStarData } from '@/onboarding/northStar';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/**
 * Human Potential Profile — backend-ready aggregate for Starpath and growth features.
 * North Star vision is stored verbatim; no summarization or rewriting.
 */
export interface HumanPotentialProfile {
  NorthStar: NorthStarData;
  personalization: Pick<
    UserPersonalizationProfile,
    'interests' | 'goals' | 'challenges' | 'aspirations' | 'growthPriorities'
  >;
  onboarding: UserPersonalizationProfile['onboarding'];
  aiPersonalizationEnabled: boolean;
  lastUpdatedAt: string | null;
}

export const EMPTY_HUMAN_POTENTIAL_PROFILE: HumanPotentialProfile = {
  NorthStar: { originalVision: '' },
  personalization: {
    interests: [],
    goals: [],
    challenges: [],
    aspirations: [],
    growthPriorities: [],
  },
  onboarding: {
    stepsCompleted: [],
    stepsSkipped: [],
    isComplete: false,
    completionPercent: 0,
  },
  aiPersonalizationEnabled: true,
  lastUpdatedAt: null,
};
