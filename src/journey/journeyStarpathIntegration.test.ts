import { buildJourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';
import { buildGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { EMPTY_DYNAMIC_WORLD } from '@/starpath/starpathDynamicWorldTypes';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';
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

const userAProfile = {
  northStar: { originalVision: 'Grow' },
  goals: ['Acting'],
  challenges: [],
  skywrites: [
    basePost({
      id: 'j1',
      skyAreaId: 'creative',
      inYourJourney: true,
      userHashtags: ['#acting'],
    }),
    basePost({
      id: 'j2',
      skyAreaId: 'creative',
      inYourJourney: true,
    }),
    basePost({ id: 'r1', skyAreaId: 'other', inYourJourney: false }),
  ],
} as UserPersonalizationProfile;

const userBProfile = {
  ...userAProfile,
  skywrites: [basePost({ id: 'b1', skyAreaId: 'finance', inYourJourney: true })],
} as UserPersonalizationProfile;

const bundleA = buildJourneyPersonalizationBundle({
  profile: userAProfile,
  selectedSkyAreaIds: [],
});
const bundleB = buildJourneyPersonalizationBundle({
  profile: userBProfile,
  selectedSkyAreaIds: [],
});

assert(bundleA.journeyLibrarySkywriteIds.join(',') === 'j1,j2', 'journey library ids');
assert(bundleA.journeyLibraryPatternAreaIds.includes('creative'), 'journey library pattern');
assert(bundleA.journeyLibraryHashtagHints.includes('#acting'), 'journey hashtags as hints');
assert(!bundleB.journeyLibraryPatternAreaIds.includes('creative'), 'user B isolated');

const privateJourney = buildJourneyPersonalizationBundle({
  profile: {
    ...userAProfile,
    skywrites: [
      basePost({
        id: 'p1',
        visibility: 'private',
        inYourJourney: true,
        skyAreaId: 'creative',
      }),
      basePost({
        id: 'p2',
        visibility: 'private',
        inYourJourney: true,
        skyAreaId: 'creative',
      }),
    ],
  } as UserPersonalizationProfile,
  selectedSkyAreaIds: [],
});
assert(privateJourney.journeyLibrarySkywriteIds.length === 0, 'private journey excluded');

const sifting = computeStarPathSiftingState([], Date.now());
const inputs = buildGuidanceSafeInputs([], sifting, EMPTY_DYNAMIC_WORLD, [], null, bundleA);
assert(inputs.explicitGoalHints.includes('#acting'), 'hashtags flow to guidance');
assert(inputs.journeyPatternAreaIds.includes('creative'), 'patterns flow to guidance');

const titleOnlyReorderProfile = {
  ...userAProfile,
  skywrites: [...userAProfile.skywrites!],
};
const bundleSame = buildJourneyPersonalizationBundle({
  profile: titleOnlyReorderProfile,
  selectedSkyAreaIds: [],
});
assert(
  bundleSame.journeyLibrarySkywriteIds.join(',') === bundleA.journeyLibrarySkywriteIds.join(','),
  'personal journey title/order store does not affect StarPath bundle',
);

console.log('[journeyStarpathIntegration.test] ok');
