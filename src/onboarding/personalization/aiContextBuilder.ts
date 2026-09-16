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
  if (profile.todayFocus?.value) {
    const focusItems = [profile.todayFocus.value];
    if (profile.todayFocus.reflection) {
      focusItems.push(profile.todayFocus.reflection);
    }
    sections.push({
      id: 'today-focus',
      title: "Today's Focus",
      items: focusItems,
    });
  }
  if (profile.communities.joined.length > 0) {
    sections.push({
      id: 'communities',
      title: 'Communities',
      items: profile.communities.joined.map((community) => community.name),
    });
  }
  if (profile.aroundYourSky.items.length > 0) {
    sections.push({
      id: 'around-your-sky',
      title: 'Recent Sky Activity',
      items: profile.aroundYourSky.items.map((item) => item.id),
    });
  }
  if (profile.mySky.constellations.length > 0) {
    sections.push({
      id: 'my-sky-patterns',
      title: 'Personal Sky Patterns',
      items: profile.mySky.constellations.map((pattern) => pattern.label),
    });
  }
  if (profile.guidingLight?.title) {
    sections.push({
      id: 'guiding-light',
      title: 'Guiding Light',
      items: [profile.guidingLight.title],
    });
  }

  return {
    enabled: sections.length > 0,
    sections,
    profile,
  };
}
