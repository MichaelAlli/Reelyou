import { canCommentOnSkywrite } from '@/skywrite/comments/canCommentOnSkywrite';
import {
  addSkywriteComment,
  commentCountForSkywrite,
  deleteSkywriteComment,
} from '@/skywrite/comments/skywriteCommentLogic';
import { EMPTY_SKYWRITE_COMMENT_STATE } from '@/skywrite/comments/skywriteCommentTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  !canCommentOnSkywrite({
    viewerId: 'viewer',
    authorId: 'author',
    visibility: 'private',
    viewerFollowsAuthor: true,
    authorFollowsViewer: true,
    viewerBlockedAuthor: false,
  }),
  'private blocks non-owner comments',
);

let state = EMPTY_SKYWRITE_COMMENT_STATE;
const first = addSkywriteComment(state, {
  skywriteId: 'sw-1',
  authorId: 'viewer',
  body: 'Thoughtful note',
  clientRequestId: 'req-1',
  starterKind: 'encourage',
});
assert('comment' in first, 'comment added');
state = first.state;

const dup = addSkywriteComment(state, {
  skywriteId: 'sw-1',
  authorId: 'viewer',
  body: 'Thoughtful note',
  clientRequestId: 'req-1',
});
assert('duplicate' in dup, 'retry deduped');

assert(commentCountForSkywrite(state, 'sw-1') === 1, 'count updated');

const removed = deleteSkywriteComment(state, first.comment.commentId, 'viewer');
assert(removed.removed != null, 'author can delete');
assert(commentCountForSkywrite(removed.state, 'sw-1') === 0, 'count after delete');

console.log('skywriteCommentLogic.test.ts — OK');
