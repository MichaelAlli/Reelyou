import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Calm fallback intentions when onboarding data is not yet available. */
export const DEFAULT_TODAY_FOCUS_SUGGESTIONS = [
  'Stay present with what matters today',
  'Move at a pace that feels honest',
  'Notice one small moment of growth',
  'Return to what feels meaningful',
] as const;

const MAX_SUGGESTIONS = 6;

function gentleGoalIntention(label: string): string {
  return `Give gentle attention to ${label.toLowerCase()}`;
}

function gentleChallengeIntention(label: string): string {
  return `Move kindly through ${label.toLowerCase()}`;
}

function northStarIntention(vision: string): string {
  const trimmed = vision.trim();
  if (!trimmed) return '';
  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed;
  if (firstSentence.length <= 72) return firstSentence;
  return `${firstSentence.slice(0, 69).trim()}…`;
}

/**
 * Build calm suggestion options from explicit onboarding selections only.
 * No external AI. User can always override with a custom intention.
 */
export function buildTodayFocusSuggestions(
  profile: Pick<
    UserPersonalizationProfile,
    'goals' | 'challenges' | 'growthPriorities' | 'northStar'
  >,
): string[] {
  const suggestions: string[] = [];

  for (const goal of profile.goals.slice(0, 3)) {
    suggestions.push(gentleGoalIntention(goal));
  }

  for (const challenge of profile.challenges.slice(0, 2)) {
    suggestions.push(gentleChallengeIntention(challenge));
  }

  for (const priority of profile.growthPriorities) {
    if (suggestions.length >= MAX_SUGGESTIONS) break;
    const lower = priority.toLowerCase();
    const duplicate = suggestions.some((s) => s.toLowerCase().includes(lower));
    if (!duplicate) {
      suggestions.push(gentleGoalIntention(priority));
    }
  }

  const northStar = northStarIntention(profile.northStar.originalVision);
  if (northStar) {
    suggestions.push(northStar);
  }

  const unique = [...new Set(suggestions.map((s) => s.trim()).filter(Boolean))];

  if (unique.length === 0) {
    return [...DEFAULT_TODAY_FOCUS_SUGGESTIONS];
  }

  return unique.slice(0, MAX_SUGGESTIONS);
}
