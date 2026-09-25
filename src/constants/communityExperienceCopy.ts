import type { EmergingConstellation } from '@/emergingConstellations/emergingConstellationTypes';
import { DEV_EMERGING_CONSTELLATION_ID } from '@/emergingConstellations/emergingConstellationFixtures';

export const CommunityExperienceCopy = {
  constellationFormingCue: 'A constellation is forming ✨',
  explore: 'Explore',
  notNow: 'Not now',
  whyThis: 'Why this? ✨',
  whyThisBody:
    'Suggested from patterns in what you’ve shared and chosen. You’re always in control.',
  aboutConstellation: 'About this constellation',
  aroundHere: 'Around here',
  caughtUp: 'You’re caught up ✨',
  exploreMore: 'Explore more',
  joined: 'Joined ✓',
  askPerspective: 'Ask for perspective',
  shareSomething: 'Share something',
  encourageSomeone: 'Encourage someone',
  joinIn: 'Join in →',
  perspectives: (count: number) =>
    count === 1 ? '1 perspective' : `${count} perspectives`,
  perspectivesTitle: 'Perspectives',
  noPerspectivesYet: 'No perspectives yet — yours could help.',
  sharePerspective: 'Share perspective',
  send: 'Send',
  perspectivePlaceholder: 'What would you tell them?',
  composeAskPlaceholder: 'What are you wondering about?',
  composeSharePlaceholder: 'Share what’s on your mind…',
  composeEncouragePlaceholder: 'A few words of encouragement…',
} as const;

export function constellationEmotionalLine(constellation: EmergingConstellation): string {
  if (constellation.id === DEV_EMERGING_CONSTELLATION_ID) {
    return 'People finding their way through change — together.';
  }
  const theme = constellation.sharedTheme?.trim();
  if (theme && theme.length <= 72) return theme;
  return 'People navigating something similar — together.';
}

export function constellationHeroTagline(constellation: EmergingConstellation): string {
  if (constellation.id === DEV_EMERGING_CONSTELLATION_ID) {
    return 'Finding our way forward — together.';
  }
  return constellationEmotionalLine(constellation);
}

export function formatPeopleHereLine(firstNames: readonly string[]): string | null {
  if (firstNames.length === 0) return null;
  if (firstNames.length === 1) return `${firstNames[0]} is here`;
  if (firstNames.length === 2) return `${firstNames[0]} and ${firstNames[1]} are here`;
  const head = firstNames.slice(0, 2).join(', ');
  return `${head} + others are here`;
}
