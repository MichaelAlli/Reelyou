import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

import { extractJourneyTextSignalsFromProfileSkywrites } from '@/journey/extractJourneyTextSignals';
import {
  countSkyAreaPatterns,
  filterJourneyLibraryForStarpathPersonalization,
  filterSkywritesForStarpathPersonalization,
} from '@/journey/journeyStarpathEligibility';

const MIN_POSTS_FOR_AREA_PATTERN = 2;
const MAX_PATTERN_AREAS = 4;

export interface JourneyPersonalizationBundle {
  northStarVision: string;
  explicitGoals: string[];
  explicitChallenges: string[];
  /** Today's Focus — temporary; must not overwrite north star in consumers. */
  todayFocusText: string | null;
  /** Selected Sky areas (“where you live in your Sky”) — explicit only. */
  skyContextAreaIds: string[];
  /** Inferred only after repeated, AI-permitted posts in the same area. */
  journeyPatternAreaIds: string[];
  /** Saved Journey Library posts (inYourJourney) permitted for StarPath — not playback order. */
  journeyLibrarySkywriteIds: string[];
  /** Repeated themes within Journey Library only — same conservative threshold. */
  journeyLibraryPatternAreaIds: string[];
  /** Explicit hashtags from Journey Library posts — tentative hints only. */
  journeyLibraryHashtagHints: string[];
  /** Phrases explicitly stated in permitted Skywrite body text. */
  journeyExplicitTextStatements: string[];
  /** Tentative theme tokens from repeated wording — not presented as facts in UI. */
  journeyTentativeThemeTokens: string[];
  /** Discovery keyword hints from explicit Skywrite phrasing. */
  journeyTextKeywordHints: string[];
  renderableSkywriteIds: string[];
}

/**
 * Combines explicit profile signals with conservative journey patterns.
 * Single posts or views must not become strong conclusions.
 */
export function buildJourneyPersonalizationBundle(input: {
  profile: UserPersonalizationProfile;
  selectedSkyAreaIds: readonly string[];
}): JourneyPersonalizationBundle {
  const eligible = filterSkywritesForStarpathPersonalization(input.profile.skywrites ?? []);
  const journeyLibrary = filterJourneyLibraryForStarpathPersonalization(input.profile.skywrites ?? []);

  const generalPatternAreaIds = countSkyAreaPatterns(
    eligible,
    MIN_POSTS_FOR_AREA_PATTERN,
    MAX_PATTERN_AREAS,
  );
  const journeyLibraryPatternAreaIds = countSkyAreaPatterns(
    journeyLibrary,
    MIN_POSTS_FOR_AREA_PATTERN,
    MAX_PATTERN_AREAS,
  );

  const journeyPatternAreaIds = [
    ...new Set([...generalPatternAreaIds, ...journeyLibraryPatternAreaIds]),
  ].slice(0, MAX_PATTERN_AREAS);

  const journeyLibraryHashtagHints = [
    ...new Set(journeyLibrary.flatMap((post) => post.userHashtags ?? [])),
  ].slice(0, 12);

  const textSignals = extractJourneyTextSignalsFromProfileSkywrites(input.profile.skywrites);

  return {
    northStarVision: input.profile.northStar.originalVision.trim(),
    explicitGoals: [...(input.profile.goals ?? [])],
    explicitChallenges: [...(input.profile.challenges ?? [])],
    todayFocusText: input.profile.todayFocus?.value?.trim() || null,
    skyContextAreaIds: [...input.selectedSkyAreaIds],
    journeyPatternAreaIds,
    journeyLibrarySkywriteIds: journeyLibrary.map((post) => post.id),
    journeyLibraryPatternAreaIds,
    journeyLibraryHashtagHints,
    journeyExplicitTextStatements: textSignals.explicitStatements,
    journeyTentativeThemeTokens: textSignals.tentativeThemeTokens,
    journeyTextKeywordHints: textSignals.keywordHints,
    renderableSkywriteIds: eligible.map((post) => post.id),
  };
}
