import { emptySkyAreaPreferences } from '@/skyAreas/skyAreaPreferencesTypes';
import {
  toggleSkyAreaSelection,
  setPauseAllContributionBeacons,
  setSkyAreaBeaconEnabled,
} from '@/skyAreas/skyAreaPreferencesLogic';
import { ORBIT_PROFILE_SKYWRITE_FIXTURES } from '@/profile/orbitProfileSkywriteFixtures';
import { beaconSignalIdForSkywrite } from '@/skywrite/beacon/skywriteBeaconEligibility';
import { EMPTY_BEACON_SYSTEM_STATE } from '@/skywrite/beacon/beaconLifecycleTypes';
import { buildViewerBeaconQueue, syncBeaconSystem } from '@/skywrite/beacon/beaconMatchEngine';
import { setBeaconTestNow } from '@/skywrite/beacon/beaconTime';
import { isRecipientEligibleForSkywriteBeacon } from '@/skywrite/beacon/beaconRecipientEligibility';
import { addSkywriteResponse, authorSaveResponse } from '@/skywrite/threads/skywriteThreadLogic';
import { EMPTY_SKYWRITE_THREAD_STATE } from '@/skywrite/threads/skywriteThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testPrivateNeverBeacons() {
  const privatePost = ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan']!.find(
    (entry) => entry.visibility === 'private',
  )!;
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'creativity');
  assert(
    !isRecipientEligibleForSkywriteBeacon(
      { ...privatePost, authorId: 'orbit-jordan' },
      'user-michael',
      prefs,
      [],
    ),
    'private never beacons',
  );
}

function testMatchingAreaEligible() {
  let prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  const question = ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan']![0];
  const t0 = 1_700_000_000_000;
  setBeaconTestNow(t0);
  const state = syncBeaconSystem({
    state: EMPTY_BEACON_SYSTEM_STATE,
    localPosts: [],
    prefs,
    blockedUserIds: [],
    now: t0,
  });
  const queue = buildViewerBeaconQueue({
    state,
    localPosts: [],
    viewerId: 'user-michael',
    prefs,
    blockedUserIds: [],
    now: t0,
  });
  assert(queue.some((entry) => entry.skywrite.id === question.id), 'growth + question eligible');

  prefs = setSkyAreaBeaconEnabled(prefs, 'growth', false);
  assert(
    !isRecipientEligibleForSkywriteBeacon(
      { ...question, authorId: 'orbit-jordan' },
      'user-michael',
      prefs,
      [],
    ),
    'beacon off blocks',
  );

  prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  prefs = setPauseAllContributionBeacons(prefs, true);
  assert(
    !isRecipientEligibleForSkywriteBeacon(
      { ...question, authorId: 'orbit-jordan' },
      'user-michael',
      prefs,
      [],
    ),
    'pause all blocks',
  );
  setBeaconTestNow(null);
}

function testAuthorNeverReceivesOwnBeacon() {
  const own: SkywriteRecord = {
    id: 'mine',
    authorId: 'user-michael',
    text: 'Help?',
    textStyle: 'plain',
    media: { photo: null, audio: null },
    mediaMode: 'text',
    visibility: 'public',
    mood: null,
    showingUp: 'question',
    intent: 'question',
    userHashtags: [],
    skyAreaId: 'growth',
    animateToSky: false,
    allowAIContext: true,
    createdAt: new Date().toISOString(),
  };
  const prefs = toggleSkyAreaSelection(emptySkyAreaPreferences('user-michael'), 'growth');
  assert(
    !isRecipientEligibleForSkywriteBeacon({ ...own, authorId: 'user-michael' }, 'user-michael', prefs, []),
    'no self-beacon',
  );
}

function testDuplicateContributionProtection() {
  const added = addSkywriteResponse(EMPTY_SKYWRITE_THREAD_STATE, {
    skywriteId: 'sw-1',
    responderId: 'orbit-jordan',
    body: 'Try rest and one small step.',
    responseId: 'resp-1',
  });
  const saved = authorSaveResponse(
    added.state,
    'sw-1',
    'resp-1',
    'growth',
    'user-michael',
    [],
  );
  assert(saved.contributions.filter((entry) => entry.state === 'active').length === 1, 'one contribution');

  const again = authorSaveResponse(
    saved.state,
    'sw-1',
    'resp-1',
    'growth',
    'user-michael',
    saved.contributions,
  );
  assert(
    again.contributions.filter((entry) => entry.state === 'active').length === 1,
    'no duplicate on re-save',
  );
}

function testSignalIdStable() {
  assert(
    beaconSignalIdForSkywrite('orbit-jordan-sw-1') === 'sig-beacon-sw-orbit-jordan-sw-1',
    'signal id',
  );
}

testPrivateNeverBeacons();
testMatchingAreaEligible();
testAuthorNeverReceivesOwnBeacon();
testDuplicateContributionProtection();
testSignalIdStable();

console.log('skywriteBeacon.test.ts — OK');
