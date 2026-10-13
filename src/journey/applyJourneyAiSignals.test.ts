import assert from 'node:assert/strict';

import { applyServerJourneySignalsToBundle } from '@/journey/applyJourneyAiSignals';
import { buildJourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';

const base = buildJourneyPersonalizationBundle({
  profile: {
    northStar: { originalVision: 'Grow' },
    goals: ['Dance'],
    challenges: [],
    skywrites: [],
  } as never,
  selectedSkyAreaIds: [],
});

const merged = applyServerJourneySignalsToBundle(base, {
  explicitGoals: ['Become a professional actor'],
  explicitSkills: ['scene study'],
  currentActivities: ['Taking acting classes'],
  statedChallenges: ['Finding representation'],
  tentativeInterests: ['acting'],
  resourceNeeds: ['agent listings'],
});

assert(merged.explicitGoals.includes('Become a professional actor'));
assert(merged.journeyTextKeywordHints.some((h) => h.includes('agent')));
assert(merged.journeyTentativeThemeTokens.includes('acting'));

console.log('[applyJourneyAiSignals.test] ok');
