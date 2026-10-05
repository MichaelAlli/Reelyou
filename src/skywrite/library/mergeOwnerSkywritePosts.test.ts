import assert from 'node:assert/strict';

import { buildAuthoredLibraryRows } from '@/skywrite/library/buildMySkywritesLibrary';
import { mergeOwnerSkywritePosts } from '@/skywrite/library/mergeOwnerSkywritePosts';
import { EMPTY_SKYWRITE_LIBRARY_STATE } from '@/skywrite/library/skywriteLibraryTypes';
import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import type { SkywriteRecord } from '@/skywrite/types';

const base: SkywriteRecord = {
  id: 'sw-1',
  authorId: 'auth-user-99',
  text: 'Posted',
  textStyle: 'plain',
  media: { photo: null, video: null, audio: null },
  mediaMode: 'text',
  visibility: 'orbit',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
  publishedAtMs: Date.now(),
  recentVisibleUntilMs: Date.now() + 30 * 24 * 60 * 60 * 1000,
};

const recent = buildAuthoredLibraryRows({
  localPosts: [base],
  library: EMPTY_SKYWRITE_LIBRARY_STATE,
  tab: 'recent',
  ownerUserId: 'auth-user-99',
});
assert.equal(recent.length, 1, 'shows for signed-in owner id');

const hidden = buildAuthoredLibraryRows({
  localPosts: [base],
  library: EMPTY_SKYWRITE_LIBRARY_STATE,
  tab: 'recent',
  ownerUserId: 'user-michael',
});
assert.equal(hidden.length, 0, 'hidden when owner id mismatches mock default');

const merged = mergeOwnerSkywritePosts(
  [{ ...base, text: 'local' }],
  [{ ...base, text: 'server', inYourJourney: true }],
);
assert.equal(merged[0]?.text, 'server');
assert.equal(merged[0]?.inYourJourney, true);

const blobLocal: SkywriteRecord = {
  ...base,
  id: 'sw-blob',
  media: {
    photo: { uri: 'blob:draft-photo', width: 100, height: 100 },
    video: null,
    audio: null,
  },
  mediaMode: 'photo',
};
const remotePersisted: SkywriteRecord = {
  ...blobLocal,
  media: {
    photo: {
      uri: buildRemoteAssetPlaceholderUri('asset-photo-1'),
      remoteAssetId: 'asset-photo-1',
      width: 100,
      height: 100,
    },
    video: null,
    audio: null,
  },
};
const mediaMerged = mergeOwnerSkywritePosts([blobLocal], [remotePersisted]);
assert.equal(
  mediaMerged[0]?.media.photo?.remoteAssetId,
  'asset-photo-1',
  'drops draft blob when server has persisted media refs',
);

console.log('mergeOwnerSkywritePosts.test.ts — OK');
