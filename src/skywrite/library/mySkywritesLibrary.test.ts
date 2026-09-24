import { EMPTY_SKYWRITE_LIBRARY_STATE } from '@/skywrite/library/skywriteLibraryTypes';
import {
  buildAuthoredLibraryRows,
  buildContributedLibraryRows,
} from '@/skywrite/library/buildMySkywritesLibrary';
import { ORBIT_PROFILE_SKYWRITE_FIXTURES } from '@/profile/orbitProfileSkywriteFixtures';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const authored: SkywriteRecord = {
  id: 'sw-owned-1',
  authorId: 'user-michael',
  text: 'My growth reflection',
  textStyle: 'plain',
  media: { photo: null, audio: null },
  mediaMode: 'text',
  visibility: 'public',
  mood: null,
  showingUp: 'reflection',
  intent: 'reflection',
  userHashtags: [],
  skyAreaId: 'growth',
  animateToSky: false,
  allowAIContext: true,
  createdAt: '2026-09-22T12:00:00.000Z',
};

const recent = buildAuthoredLibraryRows({
  localPosts: [authored],
  library: EMPTY_SKYWRITE_LIBRARY_STATE,
  tab: 'recent',
});
assert(recent.length === 1, 'recent includes authored skywrite');

const archivedState = {
  ...EMPTY_SKYWRITE_LIBRARY_STATE,
  archivedAtBySkywriteId: { 'sw-owned-1': Date.now() },
};
const archived = buildAuthoredLibraryRows({
  localPosts: [authored],
  library: archivedState,
  tab: 'archived',
});
assert(archived.length === 1, 'archived tab lists archived item');

const contributed = buildContributedLibraryRows({
  localPosts: ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan'] ?? [],
  library: EMPTY_SKYWRITE_LIBRARY_STATE,
  followGraph: EMPTY_SKY_FOLLOW_GRAPH,
  responses: [
    {
      responseId: 'resp-1',
      skywriteId: 'orbit-jordan-sw-1',
      threadId: 'thread-orbit-jordan-sw-1',
      responderId: 'user-michael',
      body: 'Perspective shared',
      createdAt: Date.now(),
      visibility: 'public',
      savedByAuthor: false,
      savedAt: null,
    },
  ],
  contributions: [],
  blockedUserIds: [],
});
assert(contributed.length === 1, 'contributed derives from responses');

console.log('mySkywritesLibrary.test.ts — OK');
