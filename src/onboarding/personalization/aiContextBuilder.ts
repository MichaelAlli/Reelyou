import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Structured context for the future AI Companion — built ONLY from the personalization profile. */
export interface AiCompanionContext {
  enabled: boolean;
  /** Human-readable sections safe for future system-prompt assembly */
  sections: AiContextSection[];
  /** Raw profile snapshot for backend handoff */
  profile: UserPersonalizationProfile | null;
}

export interface AiContextSection {
  id: string;
  title: string;
  items: string[];
}

const DISABLED_CONTEXT: AiCompanionContext = {
  enabled: false,
  sections: [],
  profile: null,
};

/**
 * AI Context Builder — future AI Companion reads ONLY from UserPersonalizationProfile.
 * No network calls. No external AI. Architecture-only.
 */
export function buildAiCompanionContext(
  profile: UserPersonalizationProfile,
): AiCompanionContext {
  if (!profile.aiPersonalizationEnabled) {
    return DISABLED_CONTEXT;
  }

  const sections: AiContextSection[] = [];

  if (profile.interests.length > 0) {
    sections.push({ id: 'interests', title: 'Interests', items: profile.interests });
  }
  if (profile.goals.length > 0) {
    sections.push({ id: 'goals', title: 'Goals', items: profile.goals });
  }
  if (profile.challenges.length > 0) {
    sections.push({ id: 'challenges', title: 'Current Challenges', items: profile.challenges });
  }
  if (profile.growthPriorities.length > 0) {
    sections.push({
      id: 'growth-priorities',
      title: 'Growth Priorities',
      items: profile.growthPriorities,
    });
  }
  if (profile.northStar.originalVision.length > 0) {
    sections.push({
      id: 'north-star',
      title: 'North Star Vision',
      items: [profile.northStar.originalVision],
    });
  }

  return {
    enabled: sections.length > 0,
    sections,
    profile,
  };
}
