import { currentUser } from '@/data/mockData';
import { BETA_CONNECTED_USER_IDS } from '@/messages/messagesConnections';
import { canonicalThreadId } from '@/messages/messagesCanonical';
import {
  acceptMessageRequestLocal,
  declineMessageRequestLocal,
  openOrCreateThread,
  receiveIncomingRequestLocal,
} from '@/messages/messagesLocalService';
import { EMPTY_MESSAGES_STATE } from '@/messages/messagesTypes';
import {
  aroundYourSkyHomeSignalIds,
  filterAroundYourSkyForHome,
  isHomePresentationHandled,
} from '@/signals/homeSignalPresentation';
import {
  buildReelyouSignals,
  shouldShowHomeGuidingLight,
} from '@/signals/reelyouSignalEngine';
import type { ReelyouSignal } from '@/signals/reelyouSignalTypes';
import { EMPTY_SIGNALS_META } from '@/signals/reelyouSignalTypes';
import { AROUND_YOUR_SKY_FIXTURES } from '@/social/aroundYourSky/fixtures';
import { DEFAULT_USER_PREFERENCES } from '@/preferences/userPreferencesTypes';
import { buildFixtureMessagesState } from '@/messages/messagesFixtures';
import { EMPTY_RESOURCE_STATE } from '@/starpath/starpathOpportunityTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testCanonicalThread() {
  const a = canonicalThreadId(currentUser.id, 'orbit-jordan');
  const b = canonicalThreadId('orbit-jordan', currentUser.id);
  assert(a === b, 'canonical thread stable');
  let state = EMPTY_MESSAGES_STATE;
  state = openOrCreateThread(state, 'orbit-jordan', BETA_CONNECTED_USER_IDS);
  state = openOrCreateThread(state, 'orbit-jordan', BETA_CONNECTED_USER_IDS);
  assert(Object.keys(state.threadsById).length === 1, 'no duplicate threads');
}

function testSignalPreviewPref() {
  const fixture = buildFixtureMessagesState();
  const sources = { starpathResourceState: EMPTY_RESOURCE_STATE, homeFeed: null };
  const withPreview = buildReelyouSignals(
    fixture,
    { ...DEFAULT_USER_PREFERENCES.signalPreferences, showMessagePreview: true },
    DEFAULT_USER_PREFERENCES.messagingPreferences,
    DEFAULT_USER_PREFERENCES.discoveryPreferences,
    EMPTY_SIGNALS_META,
    sources,
    Date.now(),
  );
  const withoutPreview = buildReelyouSignals(
    fixture,
    { ...DEFAULT_USER_PREFERENCES.signalPreferences, showMessagePreview: false },
    DEFAULT_USER_PREFERENCES.messagingPreferences,
    DEFAULT_USER_PREFERENCES.discoveryPreferences,
    EMPTY_SIGNALS_META,
    sources,
    Date.now(),
  );
  assert(withPreview.length > 0, 'fixture signals');
  assert(withoutPreview[0].description === 'New message waiting for you.', 'preview off');
}

function testMessageRequestFlow() {
  let state = receiveIncomingRequestLocal(
    EMPTY_MESSAGES_STATE,
    'orbit-3',
    'Hello from Maya',
  );
  assert(state.messageRequests.length === 1, 'request queued');
  assert(state.threadsById[state.messageRequests[0].threadId].status === 'request', 'request status');
  state = acceptMessageRequestLocal(state, state.messageRequests[0].threadId);
  assert(state.messageRequests.length === 0, 'request cleared');
  assert(state.threadsById[Object.keys(state.threadsById)[0]].status === 'active', 'promoted active');

  state = receiveIncomingRequestLocal(EMPTY_MESSAGES_STATE, 'orbit-3', 'Again');
  const tid = state.messageRequests[0].threadId;
  state = declineMessageRequestLocal(state, tid);
  assert(!state.threadsById[tid], 'decline removes thread');
}

function testGuidingLightAutoHide() {
  const unread: ReelyouSignal[] = [
    {
      signalId: 'sig-test-1',
      type: 'contribution_beacon',
      title: 'Invitation',
      description: 'Perspective',
      createdAt: Date.now(),
      sourceId: 'sw-1',
      destinationRoute: '/skywrite/sw-1',
      read: false,
      priority: 'normal',
      dismissible: true,
    },
  ];
  const readOnly: ReelyouSignal[] = [{ ...unread[0], read: true }];
  assert(shouldShowHomeGuidingLight(unread), 'unread keeps guiding light');
  assert(!shouldShowHomeGuidingLight(readOnly), 'all read hides guiding light');
  assert(!shouldShowHomeGuidingLight([]), 'no signals hides guiding light');
}

testCanonicalThread();
testSignalPreviewPref();
testMessageRequestFlow();
function testHomeOpenClearsPresentation() {
  const jordan = AROUND_YOUR_SKY_FIXTURES[0]!;
  const ids = aroundYourSkyHomeSignalIds(jordan);
  assert(ids.length > 0, 'jordan maps to signal ids');
  const meta = {
    ...EMPTY_SIGNALS_META,
    acknowledgedSignalIds: [ids[0]!],
  };
  assert(isHomePresentationHandled(meta, ids[0]!), 'acknowledged counts as handled');
  const visible = filterAroundYourSkyForHome(AROUND_YOUR_SKY_FIXTURES, meta);
  assert(!visible.some((item) => item.id === jordan.id), 'opened row removed from Home feed');
}

function testHomeDismissClearsPresentation() {
  const jordan = AROUND_YOUR_SKY_FIXTURES[0]!;
  const ids = aroundYourSkyHomeSignalIds(jordan);
  const meta = {
    ...EMPTY_SIGNALS_META,
    dismissedSignalIds: [ids[0]!],
  };
  const visible = filterAroundYourSkyForHome(AROUND_YOUR_SKY_FIXTURES, meta);
  assert(!visible.some((item) => item.id === jordan.id), 'dismissed row removed from Home feed');
}

function testAroundYourSkyEmptyMeansNoSection() {
  const allHandled = AROUND_YOUR_SKY_FIXTURES.flatMap((item) => aroundYourSkyHomeSignalIds(item));
  const meta = {
    ...EMPTY_SIGNALS_META,
    dismissedSignalIds: allHandled,
  };
  const active = filterAroundYourSkyForHome(AROUND_YOUR_SKY_FIXTURES, meta);
  assert(active.length === 0, 'all handled → no Around Your Sky section');
}

testGuidingLightAutoHide();
testHomeOpenClearsPresentation();
testHomeDismissClearsPresentation();
testAroundYourSkyEmptyMeansNoSection();
console.log('connectSystem.test.ts: all passed');
