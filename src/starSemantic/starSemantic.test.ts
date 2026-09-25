import { currentUser } from '@/data/mockData';
import {
  deriveStarSemantic,
  deriveStarSemanticFromSkywrite,
  resolvePrimaryMediaType,
} from '@/starSemantic/deriveStarSemantic';
import { exposeStarSemanticForViewer } from '@/starSemantic/starSemanticExposure';
import {
  STAR_GROWTH_MEANINGFUL,
  STAR_MEDIA_AUDIO,
  STAR_MEDIA_IMAGE,
  STAR_MEDIA_TEXT,
  STAR_MEDIA_VIDEO,
} from '@/starSemantic/starSemanticTokens';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function baseRecord(overrides: Partial<SkywriteRecord>): SkywriteRecord {
  return {
    id: 'sw-1',
    text: 'Hello',
    textStyle: 'plain',
    media: { photo: null, audio: null },
    mediaMode: 'text',
    visibility: 'public',
    mood: null,
    showingUp: null,
    userHashtags: [],
    animateToSky: false,
    allowAIContext: true,
    createdAt: '2026-09-24T12:00:00.000Z',
    ...overrides,
  };
}

function testMediaTokens() {
  assert(resolvePrimaryMediaType({ hasVideo: true, hasAudio: false, hasImage: false, hasText: true }) === 'video', 'video');
  assert(resolvePrimaryMediaType({ hasVideo: false, hasAudio: true, hasImage: true, hasText: true }) === 'audio', 'audio over image');
  assert(resolvePrimaryMediaType({ hasVideo: false, hasAudio: false, hasImage: true, hasText: true }) === 'image', 'image');
  assert(resolvePrimaryMediaType({ hasVideo: false, hasAudio: false, hasImage: false, hasText: true }) === 'text', 'text');

  const imageSemantic = deriveStarSemantic({
    sourceId: 'a',
    sourceType: 'skywrite',
    text: '',
    media: { photo: { uri: 'x' }, audio: null },
    mediaMode: 'photo',
    visibility: 'public',
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  assert(imageSemantic.primaryMediaType === 'image', 'image semantic');

  const videoSemantic = deriveStarSemantic({
    sourceId: 'b',
    sourceType: 'skywrite',
    text: 'clip',
    media: { photo: null, audio: null },
    mediaMode: 'text',
    visibility: 'public',
    createdAt: '2026-01-01T00:00:00.000Z',
    hasVideoAttachment: true,
  });
  assert(videoSemantic.primaryMediaType === 'video', 'video semantic');
}

function testGrowthFlag() {
  const ordinary = deriveStarSemanticFromSkywrite(baseRecord({ showingUp: 'reflection' }));
  assert(!ordinary.isMeaningfulGrowthMoment, 'ordinary not growth');

  const breakthrough = deriveStarSemanticFromSkywrite(baseRecord({ showingUp: 'breakthrough' }));
  assert(breakthrough.isMeaningfulGrowthMoment, 'breakthrough growth');

  const payload = deriveStarSemanticFromSkywrite(
    baseRecord({ showingUp: 'breakthrough' }),
  );
  assert(payload.isMeaningfulGrowthMoment, 'growth flag');
  void STAR_GROWTH_MEANINGFUL;
  void STAR_MEDIA_IMAGE;
  void STAR_MEDIA_VIDEO;
  void STAR_MEDIA_AUDIO;
  void STAR_MEDIA_TEXT;
}

function testPrivacyExposure() {
  const semantic = deriveStarSemanticFromSkywrite(
    baseRecord({ visibility: 'private', mediaMode: 'photo', media: { photo: { uri: 'p' }, audio: null } }),
  );
  const exposed = exposeStarSemanticForViewer(semantic, {
    viewerId: 'orbit-jordan',
    authorId: currentUser.id,
    followGraph: EMPTY_SKY_FOLLOW_GRAPH,
    blockedUserIds: [],
  });
  assert(exposed === null, 'private hidden from visitor');
}

function testMediaRecalc() {
  const first = deriveStarSemanticFromSkywrite(
    baseRecord({
      media: { photo: { uri: 'p' }, audio: null },
      mediaMode: 'photo',
    }),
  );
  assert(first.primaryMediaType === 'image', 'starts image');
  const second = deriveStarSemanticFromSkywrite(
    baseRecord({
      text: 'only text now',
      media: { photo: null, audio: null },
      mediaMode: 'text',
    }),
  );
  assert(second.primaryMediaType === 'text', 'recalc text');
}

function run() {
  testMediaTokens();
  testGrowthFlag();
  testPrivacyExposure();
  testMediaRecalc();
  console.log('starSemantic.test.ts — OK');
}

run();
