import { currentUser } from '@/data/mockData';
import {
  finiteActivitySlice,
  hasEncouraged,
  visiblePostsForViewer,
  visibleRepliesForPost,
} from '@/emergingConstellations/communitySocialLogic';
import { CAREER_TRANSITION_POST_FIXTURES } from '@/emergingConstellations/communitySocialFixtures';
import { clearCommunityMeaningfulSignalsForTests } from '@/emergingConstellations/communityMeaningfulSignalOutbox';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  finiteActivitySlice(CAREER_TRANSITION_POST_FIXTURES, 3).hasMore,
  'finite slice exposes see-more',
);
assert(
  visiblePostsForViewer(CAREER_TRANSITION_POST_FIXTURES, ['community-fixture-morgan']).every(
    (post) => post.authorUserId !== 'community-fixture-morgan',
  ),
  'blocked author posts hidden',
);
assert(
  visibleRepliesForPost(
    [
      {
        id: 'r1',
        communityId: 'c1',
        postId: 'p1',
        authorUserId: 'orbit-jordan',
        content: 'Perspective',
        moderationStatus: 'visible',
        createdAt: 1,
      },
    ],
    'p1',
    [],
  ).length === 1,
  'replies visible',
);
assert(
  hasEncouraged(
    [{ id: 'e1', communityId: 'c', targetType: 'post', targetId: 'p', fromUserId: currentUser.id, createdAt: 1 }],
    'post',
    'p',
    currentUser.id,
  ),
  'encouragement dedupe detects existing',
);

clearCommunityMeaningfulSignalsForTests();

console.log('communitySocial.test.ts — OK');
