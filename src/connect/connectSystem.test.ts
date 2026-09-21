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
import { buildReelyouSignals } from '@/signals/reelyouSignalEngine';
import { DEFAULT_USER_PREFERENCES } from '@/preferences/userPreferencesTypes';
import { EMPTY_SIGNALS_META } from '@/signals/reelyouSignalTypes';
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

testCanonicalThread();
testSignalPreviewPref();
testMessageRequestFlow();
console.log('connectSystem.test.ts: all passed');
