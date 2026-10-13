/**
 * Integration QA — My Journey → StarPath (deterministic, no live OpenAI).
 * Documents actual architecture limits: free-text NLP is NOT inferred here;
 * patterns use skyAreaId repetition, explicit profile goals, and Journey hashtags.
 */
import { buildJourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';
import { buildGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';
import { EMPTY_DYNAMIC_WORLD } from '@/starpath/starpathDynamicWorldTypes';
import { siftOpportunityCandidates } from '@/starpath/starpathOpportunitySifting';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function basePost(overrides: Partial<SkywriteRecord>): SkywriteRecord {
  return {
    id: 'sw-1',
    text: 'Hello',
    textStyle: 'plain',
    media: EMPTY_SKYWRITE_MEDIA,
    mediaMode: 'text',
    visibility: 'public',
    mood: null,
    showingUp: null,
    userHashtags: [],
    animateToSky: true,
    allowAIContext: true,
    createdAt: '2026-09-01T12:00:00.000Z',
    ...overrides,
  };
}

const actingProfile = {
  northStar: { originalVision: 'Perform on stage with confidence' },
  goals: ['Become a professional actor'],
  challenges: ['Audition confidence'],
  skywrites: [
    basePost({
      id: 'a1',
      text: 'I want to become a professional actor.',
      skyAreaId: 'creative',
      inYourJourney: true,
      userHashtags: ['#acting'],
    }),
    basePost({
      id: 'a2',
      text: "I'm taking acting classes to improve my skills.",
      skyAreaId: 'creative',
      inYourJourney: true,
    }),
    basePost({
      id: 'a3',
      text: 'Audition nerves — working on confidence.',
      skyAreaId: 'creative',
      inYourJourney: true,
    }),
  ],
} as UserPersonalizationProfile;

const entrepreneurProfile = {
  northStar: { originalVision: 'Build a sustainable business' },
  goals: ['Launch my startup'],
  challenges: ['Funding'],
  skywrites: [
    basePost({
      id: 'b1',
      text: 'Validating my product idea.',
      skyAreaId: 'entrepreneurship',
      inYourJourney: true,
    }),
    basePost({
      id: 'b2',
      text: 'Pitch practice this week.',
      skyAreaId: 'entrepreneurship',
      inYourJourney: true,
    }),
  ],
} as UserPersonalizationProfile;

const actingBundle = buildJourneyPersonalizationBundle({
  profile: actingProfile,
  selectedSkyAreaIds: ['creative'],
});
const entrepreneurBundle = buildJourneyPersonalizationBundle({
  profile: entrepreneurProfile,
  selectedSkyAreaIds: ['entrepreneurship'],
});

assert(actingBundle.explicitGoals.includes('Become a professional actor'), 'explicit goals preserved');
assert(
  actingBundle.journeyTextKeywordHints.some((h) => h.toLowerCase().includes('professional actor')),
  'acting goal extracted from Skywrite text',
);
assert(actingBundle.journeyTentativeThemeTokens.includes('acting'), 'acting theme from text');
assert(actingBundle.journeyPatternAreaIds.includes('creative'), 'acting area pattern from 3 posts');
assert(actingBundle.journeyLibraryHashtagHints.includes('#acting'), 'journey hashtag hint');
assert(
  !entrepreneurBundle.journeyPatternAreaIds.includes('creative'),
  'entrepreneur account isolated from acting areas',
);
assert(
  actingBundle.journeyLibrarySkywriteIds.length === 3,
  'journey library ids from inYourJourney only',
);

const singlePostBundle = buildJourneyPersonalizationBundle({
  profile: {
    ...actingProfile,
    skywrites: [actingProfile.skywrites![0]],
  } as UserPersonalizationProfile,
  selectedSkyAreaIds: [],
});
assert(
  !singlePostBundle.journeyPatternAreaIds.includes('creative'),
  'single post does not create area pattern',
);

const privateActing = buildJourneyPersonalizationBundle({
  profile: {
    ...actingProfile,
    skywrites: actingProfile.skywrites!.map((p) => ({ ...p, visibility: 'private' as const })),
  } as UserPersonalizationProfile,
  selectedSkyAreaIds: [],
});
assert(privateActing.journeyLibrarySkywriteIds.length === 0, 'private journey excluded');

const optOut = buildJourneyPersonalizationBundle({
  profile: {
    ...actingProfile,
    skywrites: actingProfile.skywrites!.map((p) => ({ ...p, allowAIContext: false })),
  } as UserPersonalizationProfile,
  selectedSkyAreaIds: [],
});
assert(optOut.journeyLibrarySkywriteIds.length === 0, 'allowAIContext false excluded');

const sifting = computeStarPathSiftingState([], Date.now());
const actingInputs = buildGuidanceSafeInputs(
  [],
  sifting,
  EMPTY_DYNAMIC_WORLD,
  [],
  'Practice monologues',
  actingBundle,
);
const entrepreneurInputs = buildGuidanceSafeInputs(
  [],
  sifting,
  EMPTY_DYNAMIC_WORLD,
  [],
  null,
  entrepreneurBundle,
);

assert(actingInputs.journeyPatternAreaIds.includes('creative'), 'patterns reach guidance');
assert(actingInputs.explicitGoalHints.includes('#acting'), 'hashtags merge to goal hints');
assert(
  !entrepreneurInputs.journeyPatternAreaIds.includes('creative'),
  'guidance inputs isolated per profile',
);

const actingClassOpportunity: OpportunityCandidate = {
  id: 'opp-acting-class',
  title: 'Acting workshop series',
  provider: 'fixture_catalog',
  categories: ['creative'],
  relatedBranchIds: ['creative'],
  relatedNodeIds: [],
  reasonCodes: [],
  verificationStatus: 'verified',
  freshnessStatus: 'fresh',
  fixtureOnly: true,
};
const businessGrant: OpportunityCandidate = {
  id: 'opp-business-grant',
  title: 'Small business grant',
  provider: 'fixture_catalog',
  categories: ['entrepreneurship'],
  relatedBranchIds: ['entrepreneurship'],
  relatedNodeIds: [],
  reasonCodes: [],
  verificationStatus: 'verified',
  freshnessStatus: 'fresh',
  fixtureOnly: true,
};

const now = Date.now();
const actingRanked = siftOpportunityCandidates([actingClassOpportunity, businessGrant], actingInputs, [], now);
const entrepreneurRanked = siftOpportunityCandidates(
  [actingClassOpportunity, businessGrant],
  entrepreneurInputs,
  [],
  now,
);
assert(
  actingRanked[0]?.id === 'opp-acting-class',
  'acting context ranks creative opportunity higher',
);
assert(
  entrepreneurRanked[0]?.id === 'opp-business-grant',
  'entrepreneur context ranks business opportunity higher',
);

const bundleTwiceA = buildJourneyPersonalizationBundle({
  profile: actingProfile,
  selectedSkyAreaIds: ['creative'],
});
const bundleTwiceB = buildJourneyPersonalizationBundle({
  profile: actingProfile,
  selectedSkyAreaIds: ['creative'],
});
assert(
  JSON.stringify(bundleTwiceA) === JSON.stringify(bundleTwiceB),
  'bundle is pure/deterministic — no duplicate analysis side effects',
);

console.log('[journeyStarpathQaVerification.test] ok');
