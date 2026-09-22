import { currentUser } from '@/data/mockData';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';
import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { VISITOR_PROFILE_QA_OWNER_ID } from '@/profile/visitorProfileRoute';
import { filterVisitorVisibleSkywrites } from '@/profile/buildSkywritingPreviews';
import { resolveVisitorSkyConnectionStatus } from '@/social/skyFollow/resolveVisitorSkyConnection';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testVisitorProfileJordan() {
  const view = buildVisitorProfileView({
    ownerId: 'orbit-jordan',
    connectionStatus: 'none',
  });
  assert(view !== null, 'orbit-jordan profile');
  assert(view!.identity.name === 'Jordan', 'identity name');
  assert(view!.skywritingPreviews.length > 0, 'skywriting previews');
}

function testFollowGrantsConnection() {
  const status = resolveVisitorSkyConnectionStatus('orbit-3', [], ['orbit-3']);
  assert(status === 'connected', 'follow counts as connected for visibility');
}

function testSkywriteVisibilityFilter() {
  const rows: SkywriteRecord[] = [
    {
      id: 'a',
      text: 'Public note',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'b',
      text: 'Private note',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date().toISOString(),
    },
  ];
  const visible = filterVisitorVisibleSkywrites(rows, false);
  assert(visible.length === 1 && visible[0].id === 'a', 'private hidden');
}

function testQaOwnerIsNotCurrentUser() {
  assert(VISITOR_PROFILE_QA_OWNER_ID !== currentUser.id, 'QA user is not owner');
  assert(resolveProfileRouteOwnerId(['orbit-jordan']) === 'orbit-jordan', 'param normalize');
}

function run() {
  testVisitorProfileJordan();
  testFollowGrantsConnection();
  testSkywriteVisibilityFilter();
  testQaOwnerIsNotCurrentUser();
  console.log('visitorProfile.test.ts — all cases passed');
}

run();
