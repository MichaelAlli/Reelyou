import { buildJourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';
import { compareJourneyTimelineNewestFirst, resolveSkywriteExperiencedAt } from '@/journey/journeyTimeline';
import { hasRenderableSkywriteContent } from '@/journey/skywriteJourneyContent';
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

assert(
  resolveSkywriteExperiencedAt(
    basePost({ experiencedAt: '2026-08-01T00:00:00.000Z', createdAt: '2026-09-01T00:00:00.000Z' }),
  ) === '2026-08-01T00:00:00.000Z',
  'experiencedAt wins',
);

assert(!hasRenderableSkywriteContent(basePost({ text: '', media: EMPTY_SKYWRITE_MEDIA })), 'stripped empty');

const profile = {
  northStar: { originalVision: 'Build calmly' },
  goals: ['Ship beta'],
  challenges: ['Time'],
  skywrites: [
    basePost({ id: 'a', skyAreaId: 'growth', allowAIContext: true }),
    basePost({ id: 'b', skyAreaId: 'growth', allowAIContext: true }),
    basePost({ id: 'c', skyAreaId: 'purpose', allowAIContext: true }),
  ],
} as UserPersonalizationProfile;

const bundle = buildJourneyPersonalizationBundle({
  profile,
  selectedSkyAreaIds: ['learning', 'growth'],
});

assert(bundle.skyContextAreaIds.join(',') === 'learning,growth', 'explicit sky context');
assert(bundle.journeyPatternAreaIds.includes('growth'), 'pattern after 2 growth posts');
assert(!bundle.journeyPatternAreaIds.includes('purpose'), 'single purpose post not a pattern');

assert(
  compareJourneyTimelineNewestFirst(
    basePost({ createdAt: '2026-09-02T00:00:00.000Z' }),
    basePost({ createdAt: '2026-09-01T00:00:00.000Z' }),
  ) < 0,
  'newest first',
);

console.log('journeyPersonalization.test.ts — OK');
