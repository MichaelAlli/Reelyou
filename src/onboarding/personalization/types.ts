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
};
