import { canViewSkywrite } from '@/skywrite/access/canViewSkywrite';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const author = 'user-a';
const viewer = 'user-b';

assert(
  canViewSkywrite({
    viewerId: author,
    authorId: author,
    visibility: 'private',
    viewerFollowsAuthor: false,
    authorFollowsViewer: false,
    viewerBlockedAuthor: false,
  }),
  'owner always',
);

assert(
  !canViewSkywrite({
    viewerId: viewer,
    authorId: author,
    visibility: 'private',
    viewerFollowsAuthor: true,
    authorFollowsViewer: true,
    viewerBlockedAuthor: false,
  }),
  'private hidden',
);

assert(
  !canViewSkywrite({
    viewerId: viewer,
    authorId: author,
    visibility: 'sky_friends',
    viewerFollowsAuthor: true,
    authorFollowsViewer: false,
    viewerBlockedAuthor: false,
  }),
  'one-way cannot see sky friends post',
);

assert(
  canViewSkywrite({
    viewerId: viewer,
    authorId: author,
    visibility: 'orbit',
    viewerFollowsAuthor: true,
    authorFollowsViewer: true,
    viewerBlockedAuthor: false,
  }),
  'legacy orbit alias mutual',
);

assert(
  !canViewSkywrite({
    viewerId: viewer,
    authorId: author,
    visibility: 'public',
    viewerFollowsAuthor: true,
    authorFollowsViewer: true,
    viewerBlockedAuthor: true,
  }),
  'block overrides public',
);

console.log('canViewSkywrite.test.ts — OK');
