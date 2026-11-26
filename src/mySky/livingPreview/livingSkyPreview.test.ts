import assert from 'node:assert/strict';

import {
  applyLivingSkyFeaturedToggle,
  resolveFeaturedIdsForSky,
} from '@/mySky/livingPreview/livingSkyFeaturedLogic';
import { livingSkyQaPosts } from '@/mySky/livingPreview/livingSkyQaFixtures';
import {
  livingSkyPreviewDiameter,
  placeLivingSkyPreview,
} from '@/mySky/livingPreview/livingSkyPreviewPlacement';
import {
  beginLivingSkyFadeIn,
  beginLivingSkyFadeOut,
  bindLivingSkyPreviewRotation,
  completeLivingSkyFadeIn,
  completeLivingSkyFadeOut,
  createLivingSkyCycleState,
  LIVING_SKY_PREVIEW_INTERVAL_MS,
  nextLivingSkyPreviewIndex,
  shouldCycleLivingSkyPreviews,
} from '@/mySky/livingPreview/livingSkyPreviewRotation';
import {
  livingSkyHighlightWindowId,
  resolveLivingSkyPreviewTarget,
  selectLivingSkyFeaturedMoments,
} from '@/mySky/livingPreview/livingSkyPreviewSelection';
import type {
  LivingSkyPreviewAccess,
  LivingSkyPreviewStarRef,
} from '@/mySky/livingPreview/livingSkyPreviewTypes';
import type { SkywriteRecord } from '@/skywrite/types';

const NOW = Date.parse('2026-11-26T12:00:00.000Z');

function post(partial: Partial<SkywriteRecord> & Pick<SkywriteRecord, 'id'>): SkywriteRecord {
  return {
    text: 'A moment',
    textStyle: 'plain',
    media: { photo: null, video: null, audio: null },
    mediaMode: 'text',
    visibility: 'public',
    mood: null,
    showingUp: null,
    userHashtags: [],
    animateToSky: false,
    allowAIContext: false,
    createdAt: '2026-11-20T12:00:00.000Z',
    authorId: 'owner-a',
    ...partial,
  };
}

function star(sourceId: string, x = 0.5, y = 0.4, color = '#FFD57A'): LivingSkyPreviewStarRef {
  return { id: `star-${sourceId}`, type: 'skywrite', sourceId, x, y, color };
}

const ownerAccess: LivingSkyPreviewAccess = {
  viewerId: 'owner-a',
  viewerFollowsAuthor: true,
  authorFollowsViewer: true,
  viewerBlockedAuthor: false,
};

const visitorAccess: LivingSkyPreviewAccess = {
  viewerId: 'friend-b',
  viewerFollowsAuthor: false,
  authorFollowsViewer: false,
  viewerBlockedAuthor: false,
};

function selectOwner(posts: SkywriteRecord[], manualIds: readonly string[] | null = null) {
  return selectLivingSkyFeaturedMoments({
    stars: posts.map((entry) => star(entry.id)),
    posts,
    skyOwnerId: 'owner-a',
    viewerIsOwner: true,
    access: ownerAccess,
    manualIds,
    nowMs: NOW,
  });
}

const photo = post({
  id: 'photo',
  mediaMode: 'photo',
  text: 'Walk home',
  createdAt: '2026-11-22T12:00:00.000Z',
  media: { photo: { uri: 'https://picsum.photos/seed/reellyou-demo-sky/900/700' }, video: null, audio: null },
});
const video = post({
  id: 'video',
  mediaMode: 'video',
  text: 'Breathing room',
  createdAt: '2026-11-21T12:00:00.000Z',
  media: {
    photo: null,
    video: { uri: 'https://example.com/clip.mp4', thumbnailUri: 'https://example.com/cover.jpg' },
    audio: null,
  },
});
const text = post({
  id: 'text',
  mediaMode: 'text',
  text: 'Choosing patience',
  createdAt: '2026-11-25T12:00:00.000Z',
});

const three = selectOwner([text, photo, video]);
assert.equal(three.mode, 'automatic');
assert.deepEqual(
  three.moments.map((moment) => moment.postId),
  ['text', 'photo', 'video'],
);
assert.equal(three.moments[0]?.starX, 0.5);
assert.equal(three.moments[1]?.presentation, 'photo');
assert.equal(three.moments[1]?.imageUri, 'https://picsum.photos/seed/reellyou-demo-sky/900/700');
assert.equal(three.moments[2]?.presentation, 'video');
assert.equal(three.moments[2]?.imageUri, 'https://example.com/cover.jpg');

const starsBefore = JSON.stringify([star('text'), star('photo'), star('video')]);
selectOwner([text, photo, video]);
assert.equal(JSON.stringify([star('text'), star('photo'), star('video')]), starsBefore);

const one = selectOwner([photo]);
assert.equal(one.moments.length, 1);
assert.equal(shouldCycleLivingSkyPreviews(one.moments.length, false, false), false);

const none = selectOwner([]);
assert.equal(none.moments.length, 0);

const privatePost = post({ id: 'private', visibility: 'private', text: 'Secret' });
const friendsPost = post({
  id: 'friends',
  visibility: 'sky_friends',
  text: 'Friends only',
  createdAt: '2026-11-24T12:00:00.000Z',
});
const other = post({ id: 'other', authorId: 'owner-z', text: 'Not this sky' });
const visitorSelection = selectLivingSkyFeaturedMoments({
  stars: [text, photo, video, privatePost, friendsPost, other].map((entry) => star(entry.id)),
  posts: [text, photo, video, privatePost, friendsPost, other],
  skyOwnerId: 'owner-a',
  viewerIsOwner: false,
  access: visitorAccess,
  manualIds: ['private', 'other', 'photo'],
  nowMs: NOW,
});
assert.deepEqual(
  visitorSelection.moments.map((moment) => moment.postId),
  ['photo'],
);
assert.equal(visitorSelection.moments.some((moment) => moment.postId === 'private'), false);
assert.equal(visitorSelection.moments.some((moment) => moment.postId === 'other'), false);

const mutual = selectLivingSkyFeaturedMoments({
  stars: [friendsPost].map((entry) => star(entry.id)),
  posts: [friendsPost],
  skyOwnerId: 'owner-a',
  viewerIsOwner: false,
  access: { ...visitorAccess, viewerFollowsAuthor: true, authorFollowsViewer: true },
  manualIds: null,
  nowMs: NOW,
});
assert.equal(mutual.moments[0]?.postId, 'friends');

const blocked = selectLivingSkyFeaturedMoments({
  stars: [text].map((entry) => star(entry.id)),
  posts: [text],
  skyOwnerId: 'owner-a',
  viewerIsOwner: false,
  access: { ...visitorAccess, viewerBlockedAuthor: true },
  manualIds: null,
  nowMs: NOW,
});
assert.equal(blocked.moments.length, 0);

const voice = post({
  id: 'voice',
  mediaMode: 'voice',
  text: '',
  media: { photo: null, video: null, audio: { uri: 'https://example.com/a.mp3' } },
});
assert.equal(selectOwner([voice]).moments.length, 0);

const expiredReel = post({
  id: 'expired-reel',
  mediaMode: 'video',
  text: 'Gone',
  createdAt: '2026-10-01T12:00:00.000Z',
  recentVisibleUntilMs: NOW - 1000,
  skyreelActiveUntilMs: NOW - 1000,
  media: { photo: null, video: { uri: 'file://clip.mp4' }, audio: null },
});
assert.equal(selectOwner([expiredReel]).moments.length, 0);

const manual = selectOwner([text, photo, video], ['video', 'photo', 'missing', 'text', 'video']);
assert.equal(manual.mode, 'manual');
assert.deepEqual(
  manual.moments.map((moment) => moment.postId),
  ['video', 'photo', 'text'],
);

const target = resolveLivingSkyPreviewTarget('photo');
assert.equal(target.kind, 'skywrite-detail');
assert.equal(target.skywriteId, 'photo');
assert.notEqual(target.kind, 'skywrite-play');

const limit = applyLivingSkyFeaturedToggle(['a', 'b', 'c'], 'd');
assert.equal(limit.reason, 'limit');
assert.deepEqual(limit.ids, ['a', 'b', 'c']);
const removed = applyLivingSkyFeaturedToggle(['a', 'b', 'c'], 'b');
assert.deepEqual(removed.ids, ['a', 'c']);
assert.equal(
  resolveFeaturedIdsForSky({
    viewerIsOwner: false,
    deviceDraftIds: ['mine'],
    override: undefined,
  }),
  null,
);

assert.equal(shouldCycleLivingSkyPreviews(3, false, false), true);
assert.equal(shouldCycleLivingSkyPreviews(3, true, false), false);
assert.equal(shouldCycleLivingSkyPreviews(3, false, true), false);
assert.equal(nextLivingSkyPreviewIndex(2, 3), 0);
assert.equal(LIVING_SKY_PREVIEW_INTERVAL_MS, 4000);

const cleared: number[] = [];
let timers = 0;
const stop = bindLivingSkyPreviewRotation({
  count: 3,
  paused: false,
  reducedMotion: false,
  onAdvance: () => {},
  setIntervalFn: () => {
    timers += 1;
    return 7;
  },
  clearIntervalFn: (id) => cleared.push(id),
});
assert.equal(timers, 1);
stop();
stop();
assert.deepEqual(cleared, [7]);

const pausedStop = bindLivingSkyPreviewRotation({
  count: 3,
  paused: true,
  reducedMotion: false,
  onAdvance: () => {},
  setIntervalFn: () => {
    timers += 1;
    return 1;
  },
});
pausedStop();
assert.equal(timers, 1);

const phones = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
];

for (const phone of phones) {
  const canvasWidth = phone.width - 16;
  const canvasHeight = Math.min(Math.max(Math.round(phone.height * 0.58), 320), 520);
  const diameter = livingSkyPreviewDiameter(canvasWidth);
  assert.ok(diameter >= 80 && diameter <= 96, `diameter ${diameter} for ${phone.width}`);
  for (const point of [
    { x: 0.04, y: 0.08 },
    { x: 0.96, y: 0.9 },
    { x: 0.5, y: 0.45 },
  ]) {
    const frame = placeLivingSkyPreview({
      starX: point.x,
      starY: point.y,
      width: canvasWidth,
      height: canvasHeight,
      bottomClearance: 12,
    });
    assert.ok(frame, `frame for ${phone.width} at ${point.x},${point.y}`);
    assert.ok(frame.left >= 8);
    assert.ok(frame.top >= 8);
    assert.ok(frame.left + frame.diameter <= canvasWidth - 8);
    assert.ok(frame.top + frame.diameter <= canvasHeight - 12);
    const starX = point.x * canvasWidth;
    const starY = point.y * canvasHeight;
    const centerX = frame.left + frame.diameter / 2;
    const centerY = frame.top + frame.diameter / 2;
    const distance = Math.hypot(centerX - starX, centerY - starY);
    assert.ok(distance > frame.diameter / 2, 'preview must not cover the star center');
  }
}

const qaThree = livingSkyQaPosts('three');
assert.deepEqual(
  qaThree.map((entry) => entry.mediaMode),
  ['text', 'photo', 'video'],
);
const qaVisitor = livingSkyQaPosts('visitor');
assert.equal(qaVisitor.some((entry) => entry.visibility === 'private'), true);
assert.equal(livingSkyQaPosts('none').length, 0);
assert.equal(livingSkyQaPosts('one').length, 1);
assert.equal(livingSkyQaPosts('two').length, 2);

const day = 24 * 60 * 60 * 1000;
const older = [0, 1, 2, 3].map((offset) =>
  post({
    id: `older-${offset}`,
    createdAt: new Date(NOW - (10 + offset) * day).toISOString(),
  }),
);
const windowA = livingSkyHighlightWindowId(NOW);
const windowB = livingSkyHighlightWindowId(NOW + day);
assert.notEqual(windowA, windowB);
const highlightsA = selectOwner(older, null);
const highlightsAAgain = selectLivingSkyFeaturedMoments({
  stars: older.map((entry) => star(entry.id)),
  posts: older,
  skyOwnerId: 'owner-a',
  viewerIsOwner: true,
  access: ownerAccess,
  manualIds: null,
  nowMs: NOW,
});
assert.deepEqual(
  highlightsA.moments.map((moment) => moment.postId),
  highlightsAAgain.moments.map((moment) => moment.postId),
);
assert.equal(highlightsA.moments.length, 3);
assert.equal(highlightsA.moments[0]?.postId, 'older-0');
const highlightsB = selectLivingSkyFeaturedMoments({
  stars: older.map((entry) => star(entry.id)),
  posts: older,
  skyOwnerId: 'owner-a',
  viewerIsOwner: true,
  access: ownerAccess,
  manualIds: null,
  nowMs: NOW + day,
});
assert.notDeepEqual(
  highlightsA.moments.map((moment) => moment.postId),
  highlightsB.moments.map((moment) => moment.postId),
);
const fresh = post({ id: 'fresh', createdAt: new Date(NOW - 60 * 60 * 1000).toISOString() });
const withFresh = selectLivingSkyFeaturedMoments({
  stars: [fresh, ...older].map((entry) => star(entry.id)),
  posts: [fresh, ...older],
  skyOwnerId: 'owner-a',
  viewerIsOwner: true,
  access: ownerAccess,
  manualIds: null,
  nowMs: NOW,
});
assert.equal(withFresh.moments[0]?.postId, 'fresh');
assert.equal(withFresh.moments.some((moment) => moment.postId === 'fresh'), true);

const manualTwo = selectOwner([text, photo, video], ['photo', 'text']);
assert.equal(manualTwo.mode, 'manual');
assert.deepEqual(
  manualTwo.moments.map((moment) => moment.postId),
  ['photo', 'text'],
);
const manualNone = selectOwner([text, photo, video], []);
assert.equal(manualNone.mode, 'manual');
assert.equal(manualNone.moments.length, 0);
const manualStale = selectOwner([text, photo], ['missing']);
assert.equal(manualStale.mode, 'manual');
assert.equal(manualStale.moments.length, 0);

let cycle = createLivingSkyCycleState();
assert.equal(beginLivingSkyFadeIn(cycle).phase, 'visible');
cycle = beginLivingSkyFadeOut(cycle);
assert.equal(cycle.phase, 'fading-out');
assert.equal(cycle.index, 0);
cycle = completeLivingSkyFadeOut(cycle, 3);
assert.equal(cycle.phase, 'hidden');
assert.equal(cycle.index, 1);
cycle = beginLivingSkyFadeIn(cycle);
assert.equal(cycle.phase, 'fading-in');
assert.equal(cycle.index, 1);
cycle = completeLivingSkyFadeIn(cycle);
assert.equal(cycle.phase, 'visible');

console.log('livingSkyPreview.test.ts ok');
