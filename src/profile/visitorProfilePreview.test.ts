import { currentUser } from '@/data/mockData';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testSelfPreviewHidesPrivate() {
  const skywrites: SkywriteRecord[] = [
    {
      id: 'pub',
      authorId: currentUser.id,
      text: 'Public note',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: false,
      allowAIContext: true,
      createdAt: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'priv',
      authorId: currentUser.id,
      text: 'Private note',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: false,
      allowAIContext: true,
      createdAt: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'conn',
      authorId: currentUser.id,
      text: 'Connected only',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'sky_friends',
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: false,
      allowAIContext: true,
      createdAt: '2026-09-24T12:00:00.000Z',
    },
  ];

  const publicView = buildVisitorProfileView({
    ownerId: currentUser.id,
    viewerId: currentUser.id,
    connectionStatus: 'none',
    followGraph: EMPTY_SKY_FOLLOW_GRAPH,
    blockedUserIds: [],
    ownerSkywrites: skywrites,
    previewAccessMode: 'public',
  });
  assert(publicView !== null, 'public preview view');
  assert(
    publicView!.skywritings.items.some((item) => item.id === 'pub'),
    'public item visible',
  );
  assert(
    !publicView!.skywritings.items.some((item) => item.id === 'priv'),
    'private hidden',
  );
  assert(
    !publicView!.skywritings.items.some((item) => item.id === 'conn'),
    'connected hidden in public preview',
  );

  const connectedView = buildVisitorProfileView({
    ownerId: currentUser.id,
    viewerId: currentUser.id,
    connectionStatus: 'none',
    followGraph: EMPTY_SKY_FOLLOW_GRAPH,
    blockedUserIds: [],
    ownerSkywrites: skywrites,
    previewAccessMode: 'connected',
  });
  assert(
    connectedView!.skywritings.items.some((item) => item.id === 'conn'),
    'connected item in connected preview',
  );
}

function run() {
  testSelfPreviewHidesPrivate();
  console.log('visitorProfilePreview.test.ts — OK');
}

run();
