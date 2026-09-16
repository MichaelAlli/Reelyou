import type { CommunityId, JoinedCommunity } from '@/onboarding/personalization/communities/types';
import type { TodayFocusSource } from '@/onboarding/personalization/todayFocus/types';

/** Explicit community membership — user join/leave actions are authoritative. */
export interface UserCommunities {
  joined: JoinedCommunity[];
  explicitInterests: CommunityId[];
}

/** Active daily intention + reflection — optional slice on the personalization profile. */
export interface UserTodayFocus {
  value: string;
  source: TodayFocusSource;
  dateKey: string | null;
  selectedAt: string | null;
  reflection: string | null;
  reflectionUpdatedAt: string | null;
}

/**
 * Centralized User Personalization Profile — populated ONLY from explicit user input
 * across all onboarding screens. Never invent fields.
 */
export interface UserPersonalizationProfile {
  /** Interest labels chosen on Screen 1 */
  interests: string[];
  /** Goal labels chosen on Screen 2 */
  goals: string[];
  /** Challenge labels chosen on Screen 3 */
  challenges: string[];
  /** Derived aspirations from stated goals (same labels — no inference) */
  aspirations: string[];
  /** Combined growth focus from goals + challenges explicitly selected */
  growthPriorities: string[];
  /** Onboarding progress metadata */
  onboarding: {
    stepsCompleted: string[];
    stepsSkipped: string[];
    isComplete: boolean;
    completionPercent: number;
  };
  /** User-controlled AI personalization toggle */
  aiPersonalizationEnabled: boolean;
  /** Screen 4 — North Star vision (verbatim, never modified) */
  northStar: {
    originalVision: string;
  };
  /** ISO timestamp of last normalization — null until first merge */
  lastUpdatedAt: string | null;
  /** Calm daily intention chosen on Home — null until user selects one today */
  todayFocus: UserTodayFocus | null;
  /** Communities the user has explicitly joined or shown interest in */
  communities: UserCommunities;
}

export const EMPTY_PERSONALIZATION_PROFILE: UserPersonalizationProfile = {
  interests: [],
  goals: [],
  challenges: [],
  aspirations: [],
  growthPriorities: [],
  northStar: { originalVision: '' },
  onboarding: {
    stepsCompleted: [],
    stepsSkipped: [],
    isComplete: false,
    completionPercent: 0,
  },
  aiPersonalizationEnabled: true,
  lastUpdatedAt: null,
  todayFocus: null,
  communities: {
    joined: [],
    explicitInterests: [],
  },
};
