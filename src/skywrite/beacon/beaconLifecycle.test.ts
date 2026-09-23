import { emptySkyAreaPreferences } from '@/skyAreas/skyAreaPreferencesTypes';
import { toggleSkyAreaSelection } from '@/skyAreas/skyAreaPreferencesLogic';
import { CONTRIBUTION_BEACON_BATCH_SIZE } from '@/skywrite/beacon/beaconLifecycleConfig';
import { EMPTY_BEACON_SYSTEM_STATE } from '@/skywrite/beacon/beaconLifecycleTypes';
import { BEACON_ACTIVE_LIFECYCLE_MS } from '@/skywrite/beacon/beaconLifecycleConfig';
import {
  buildViewerBeaconQueue,
  setAuthorBeaconResolved,
  syncBeaconSystem,
  updateMatchStatus,
} from '@/skywrite/beacon/beaconMatchEngine';
import { setBeaconTestNow, beaconNow } from '@/skywrite/beacon/beaconTime';
import { isRecipientEligibleForSkywriteBeacon } from '@/skywrite/beacon/beaconRecipientEligibility';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function makeQuestion(id: string, authorId: string, area: 'growth' = 'growth'): SkywriteRecord {
  return {
    id,
    authorId,
    text: `Question ${id}?`,
    textStyle: 'plain',
    media: { photo: null, audio: null },
    mediaMode: 'text',
    visibility: 'public',
    mood: null,
    showingUp: 'question',
    intent: 'question',
    userHashtags: [],
    skyAreaId: area,
    animateToSky: false,
    allowAIContext: true,
    createdAt: new Date(beaconNow()).toISOString(),
  };
}

function testUncappedQueue() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const posts: SkywriteRecord[] = [];
  for (let i = 0; i < 37; i += 1) {
    posts.push(makeQuestion(`sw-batch-${i}`, 'orbit-jordan'));
  }
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  let state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t0,
    recipientPool: ['user-michael'],
  });
  const queue = buildViewerBeaconQueue({
    state,
    localPosts: posts,
    viewerId: 'user-michael',
    prefs,
    blockedUserIds: [],
    now: t0,
  });
  const batchMatches = state.matches.filter(
    (m) => m.recipientUserId === 'user-michael' && m.skywriteId.startsWith('sw-batch-'),
  );
  const batchQueue = queue.filter((entry) => entry.skywrite.id.startsWith('sw-batch-'));
  assert(
    batchMatches.length >= 37,
    `expected >=37 batch matches, got ${batchMatches.length}`,
  );
  assert(
    batchQueue.length >= 37,
    `expected >=37 batch queue, got ${batchQueue.length}`,
  );
  assert(CONTRIBUTION_BEACON_BATCH_SIZE === 10, 'ui batch size 10');
  setBeaconTestNow(null);
}

function testIgnoredNotReserved() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const posts = [makeQuestion('sw-ignore', 'orbit-jordan')];
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  let state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t0,
  });
  state = updateMatchStatus(state, 'sw-ignore', 'user-michael', 'ignored', t0 + 1000);
  const queue = buildViewerBeaconQueue({
    state,
    localPosts: posts,
    viewerId: 'user-michael',
    prefs,
    blockedUserIds: [],
    now: t0 + 2000,
  });
  const forPost = queue.filter((entry) => entry.skywrite.id === 'sw-ignore');
  assert(forPost.length === 0, 'ignored user not re-served for same skywrite');
  setBeaconTestNow(null);
}

function testRematchNewRecipient() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const posts = [makeQuestion('sw-rematch', 'orbit-jordan')];
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  let state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t0,
  });
  state = updateMatchStatus(state, 'sw-rematch', 'user-michael', 'ignored', t0 + 1000);
  const t1 = t0 + 20 * 3600_000;
  setBeaconTestNow(t1);
  state = syncBeaconSystem({
    state,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t1,
  });
  const forMichael = state.matches.filter(
    (m) => m.skywriteId === 'sw-rematch' && m.recipientUserId === 'user-michael',
  );
  assert(forMichael.every((m) => m.status === 'ignored'), 'michael stays ignored');
  const forAlex = state.matches.some(
    (m) => m.skywriteId === 'sw-rematch' && m.recipientUserId === 'user-beta-alex',
  );
  assert(forAlex, 'rematch reaches new recipient');
  setBeaconTestNow(null);
}

function testFourteenDayExpiry() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const posts = [makeQuestion('sw-expire', 'orbit-jordan')];
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  let state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t0,
    recipientPool: ['user-michael'],
  });
  const tEnd = t0 + BEACON_ACTIVE_LIFECYCLE_MS + 1000;
  state = syncBeaconSystem({
    state,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: tEnd,
    recipientPool: ['user-michael'],
  });
  assert(state.lifecycles['sw-expire']?.beaconStatus === 'expired', '14-day lifecycle expires');
  setBeaconTestNow(null);
}

function testResolvedStopsRematch() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const posts = [makeQuestion('sw-resolved', 'orbit-jordan')];
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  let state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: t0,
    recipientPool: ['user-michael'],
  });
  const matchesBefore = state.matches.filter((m) => m.skywriteId === 'sw-resolved').length;
  state = setAuthorBeaconResolved(state, 'sw-resolved', true, t0 + 500);
  const tRematch = t0 + 20 * 3600_000;
  state = syncBeaconSystem({
    state,
    localPosts: posts,
    prefs,
    blockedUserIds: [],
    now: tRematch,
    recipientPool: ['user-beta-alex'],
  });
  const matchesAfter = state.matches.filter((m) => m.skywriteId === 'sw-resolved').length;
  assert(matchesAfter === matchesBefore, 'resolved skywrite does not gain rematch matches');
  assert(state.lifecycles['sw-resolved']?.beaconStatus === 'resolved', 'lifecycle stays resolved');
  setBeaconTestNow(null);
}

function testPrivateNeverEligible() {
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const post = { ...makeQuestion('sw-private', 'orbit-jordan'), visibility: 'private' as const };
  assert(
    !isRecipientEligibleForSkywriteBeacon(
      { ...post, authorId: 'orbit-jordan' },
      'user-michael',
      prefs,
      [],
    ),
    'private blocked',
  );
}

testUncappedQueue();
testIgnoredNotReserved();
testRematchNewRecipient();
testFourteenDayExpiry();
testResolvedStopsRematch();
testPrivateNeverEligible();

console.log('beaconLifecycle.test.ts — OK');
