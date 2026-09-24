import { resolveSkywriteSkyAreaId } from '@/skyAreas/resolveSkywriteSkyAreaId';
import type { SkywriteRecord } from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function base(overrides: Partial<SkywriteRecord>): SkywriteRecord {
  return {
    id: 'sw-1',
    authorId: 'user-michael',
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
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

assert(resolveSkywriteSkyAreaId(base({ skyAreaId: 'creativity' })) === 'creativity', 'explicit id');
assert(
  resolveSkywriteSkyAreaId(base({ skyAreaId: 'custom-starting-over-1' })) === 'custom-starting-over-1',
  'custom id',
);
assert(
  resolveSkywriteSkyAreaId(base({ userHashtags: ['career'], text: '#career change' })) === 'growth',
  'hashtags do not infer area',
);

console.log('resolveSkywriteSkyAreaId.test.ts — OK');
