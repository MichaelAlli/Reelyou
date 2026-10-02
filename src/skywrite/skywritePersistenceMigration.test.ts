import assert from 'node:assert/strict';

import { migrateSkywritesForUser } from '@/skywrite/skywritePersistenceMigration';
import { EMPTY_SKYWRITES } from '@/skywrite/types';

const legacy = {
  ...EMPTY_SKYWRITES,
  posts: [
    {
      id: 'sw-legacy-1',
      authorId: 'user-michael',
      text: 'Before sign-in',
      textStyle: 'plain' as const,
      media: { photo: null, video: null, audio: null },
      mediaMode: 'text' as const,
      visibility: 'orbit' as const,
      mood: null,
      showingUp: null,
      userHashtags: [],
      animateToSky: true,
      allowAIContext: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

const migrated = migrateSkywritesForUser(legacy, 'auth-user-abc');
assert.equal(migrated.posts.length, 1, 'keeps legacy posts');
assert.equal(migrated.posts[0]?.authorId, 'auth-user-abc');

console.log('skywritePersistenceMigration.test.ts — OK');
