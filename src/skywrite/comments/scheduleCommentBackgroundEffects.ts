import {
  buildRelateObservationFromComment,
  removeRelateObservationForComment,
  upsertRelateObservation,
} from '@/skywrite/comments/relateWeakSignalLogic';
import {
  loadRelateWeakObservationState,
  saveRelateWeakObservationState,
} from '@/skywrite/comments/relateWeakSignalPersistence';
import type { SkywriteCommentRecord } from '@/skywrite/comments/skywriteCommentTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/**
 * Async, non-blocking personalization ingest for submitted comments.
 * Failures must not affect commenting.
 */
export function scheduleCommentBackgroundEffects(
  comment: SkywriteCommentRecord,
  skywrite: SkywriteRecord | undefined,
): void {
  void Promise.resolve().then(async () => {
    if (!skywrite || comment.starterKind !== 'relate') return;
    const observation = buildRelateObservationFromComment(comment, skywrite);
    if (!observation) return;
    const state = await loadRelateWeakObservationState();
    const next = upsertRelateObservation(state, observation);
    await saveRelateWeakObservationState(next);
  });
}

export function scheduleCommentRemovalBackgroundEffects(commentId: string): void {
  void Promise.resolve().then(async () => {
    const state = await loadRelateWeakObservationState();
    await saveRelateWeakObservationState(removeRelateObservationForComment(state, commentId));
  });
}
