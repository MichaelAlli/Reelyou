import type { JourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';

export interface ServerJourneyStarpathSignals {
  explicitGoals: string[];
  explicitSkills: string[];
  currentActivities: string[];
  statedChallenges: string[];
  tentativeInterests: string[];
  resourceNeeds: string[];
}

/** Merge server structured AI signals into the journey bundle (deterministic base preserved). */
export function applyServerJourneySignalsToBundle(
  bundle: JourneyPersonalizationBundle,
  server: ServerJourneyStarpathSignals | null | undefined,
): JourneyPersonalizationBundle {
  if (!server) return bundle;

  const explicitStatements = [
    ...server.explicitGoals,
    ...server.currentActivities,
    ...server.statedChallenges,
  ];

  const keywordHints = [
    ...server.resourceNeeds,
    ...server.explicitSkills,
    ...server.explicitGoals,
  ];

  return {
    ...bundle,
    explicitGoals: [...new Set([...bundle.explicitGoals, ...server.explicitGoals])],
    explicitChallenges: [
      ...new Set([...bundle.explicitChallenges, ...server.statedChallenges]),
    ],
    journeyExplicitTextStatements: [
      ...new Set([...bundle.journeyExplicitTextStatements, ...explicitStatements]),
    ].slice(0, 16),
    journeyTentativeThemeTokens: [
      ...new Set([...bundle.journeyTentativeThemeTokens, ...server.tentativeInterests]),
    ].slice(0, 24),
    journeyTextKeywordHints: [
      ...new Set([...bundle.journeyTextKeywordHints, ...keywordHints]),
    ].slice(0, 20),
  };
}
