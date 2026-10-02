import assert from 'node:assert/strict';

import {
  applyPublishRetentionFields,
  isSkywriteInRecentLibrary,
  isSkywriteInYourJourney,
  SKYWRITE_RECENT_RETENTION_MS,
} from '@/skywrite/library/skywriteLibraryRetention';
import type { SkywriteRecord } from '@/skywrite/types';

const base: SkywriteRecord = {
  id: 'a',
  authorId: 'u',
  text: 'hi',
  textStyle: 'plain',
  media: { photo: null, video: null, audio: null },
  mediaMode: 'text',
  visibility: 'orbit',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: '2026-01-01T12:00:00.000Z',
};

const published = applyPublishRetentionFields(base, { addToYourJourney: false }, Date.parse('2026-01-01T12:00:00.000Z'));
assert.equal(published.recentVisibleUntilMs, Date.parse('2026-01-01T12:00:00.000Z') + SKYWRITE_RECENT_RETENTION_MS);
assert.equal(isSkywriteInRecentLibrary(published, Date.parse('2026-01-15T12:00:00.000Z')), true);
assert.equal(
  isSkywriteInRecentLibrary(published, published.recentVisibleUntilMs! + 1),
  false,
);

const journey = applyPublishRetentionFields(base, { addToYourJourney: true });
assert.equal(isSkywriteInYourJourney(journey), true);
assert.equal(isSkywriteInRecentLibrary(journey, journey.recentVisibleUntilMs! + 999), true);

assert.equal(isSkywriteInRecentLibrary(base, Date.now()), true);

console.log('skywriteLibraryRetention.test.ts — OK');
