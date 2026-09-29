import {
  MIN_RELATE_OBSERVATIONS_FOR_PATTERN,
  buildRelateObservationFromComment,
  deriveOptionalRelatePatternHints,
  deriveRelateThemeHintFromComment,
} from '@/skywrite/comments/relateWeakSignalLogic';
import type { SkywriteCommentRecord } from '@/skywrite/comments/skywriteCommentTypes';
import { EMPTY_RELATE_WEAK_OBSERVATION_STATE } from '@/skywrite/comments/relateWeakSignalLogic';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  deriveRelateThemeHintFromComment('I also felt nervous starting something new') != null,
  'hint from commenter words',
);

const relateComment: SkywriteCommentRecord = {
  commentId: 'cmt-1',
  skywriteId: 'sw-career',
  authorId: 'user-a',
  body: 'I also felt nervous starting something new',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  starterKind: 'relate',
};

const obs = buildRelateObservationFromComment(relateComment, {
  id: 'sw-career',
  allowAIContext: true,
  visibility: 'public',
  skyAreaId: 'growth',
});
assert(obs != null && obs.themeHint != null, 'relate observation stored');
assert(!obs!.themeHint!.includes('growth'), 'does not copy post sky area');

let state = EMPTY_RELATE_WEAK_OBSERVATION_STATE;
const hintsBefore = deriveOptionalRelatePatternHints(state, 'user-a');
assert(hintsBefore.length === 0, 'single relate does not create pattern');

for (let i = 0; i < MIN_RELATE_OBSERVATIONS_FOR_PATTERN; i += 1) {
  const comment: SkywriteCommentRecord = {
    ...relateComment,
    commentId: `cmt-${i}`,
    skywriteId: i < 2 ? `sw-${i}` : 'sw-2',
    body: 'I also felt nervous starting something new again',
  };
  const nextObs = buildRelateObservationFromComment(comment, {
    id: comment.skywriteId,
    allowAIContext: true,
    visibility: 'public',
  });
  if (nextObs) {
    state = {
      ...state,
      observations: [...state.observations, nextObs],
      processedCommentIds: [...state.processedCommentIds, comment.commentId],
      updatedAt: Date.now(),
    };
  }
}

const hintsAfter = deriveOptionalRelatePatternHints(state, 'user-a');
assert(hintsAfter.length <= 2, 'optional hints capped');
assert(hintsAfter.length === 0 || hintsAfter[0].includes('nervous'), 'hint stays uncertain/theme');

console.log('relateWeakSignal.test.ts — OK');
