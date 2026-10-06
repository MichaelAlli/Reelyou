import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { isSkyReelActive } from '@/skywrite/play/skyReelActive';
import type { SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { uniqueSkywriteIdsInPlayOrder } from '@/skywrite/play/skywriteStorySegments';

export function isStepSkyReelAppearanceActive(
  step: SkywritePlayStep,
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
  postsById?: ReadonlyMap<string, SkywriteRecord>,
): boolean {
  const post = postsById?.get(step.skywriteId);
  if (post) return isSkyReelActive(post, registry, nowMs);
  const entry = registry[step.skywriteId];
  if (!entry) return false;
  return isSkyReelActive(
    { id: step.skywriteId, createdAt: entry.publishedAt },
    registry,
    nowMs,
  );
}

/** Remove steps belonging to expired SkyReel appearances before playback. */
export function filterPlayStepsToActiveSkyReel(
  steps: readonly SkywritePlayStep[],
  registry: PlaySkySequenceRegistry,
  postsById: ReadonlyMap<string, SkywriteRecord>,
  nowMs = Date.now(),
): SkywritePlayStep[] {
  return steps.filter((step) => {
    const post = postsById.get(step.skywriteId);
    if (!post) return false;
    return isSkyReelActive(post, registry, nowMs);
  });
}

/** First step index whose post still has an active SkyReel appearance. */
export function findFirstEligibleStepIndex(
  steps: readonly SkywritePlayStep[],
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
  postsById?: ReadonlyMap<string, SkywriteRecord>,
): number | null {
  for (let i = 0; i < steps.length; i += 1) {
    if (isStepSkyReelAppearanceActive(steps[i]!, registry, nowMs, postsById)) return i;
  }
  return null;
}

/** Distinct skywrite ids in steps that still have an active appearance. */
export function countEligibleSkywritePostsInSteps(
  steps: readonly SkywritePlayStep[],
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
  postsById?: ReadonlyMap<string, SkywriteRecord>,
): number {
  const seen = new Set<string>();
  let count = 0;
  for (const step of steps) {
    if (seen.has(step.skywriteId)) continue;
    seen.add(step.skywriteId);
    if (isStepSkyReelAppearanceActive(step, registry, nowMs, postsById)) count += 1;
  }
  return count;
}

/**
 * After skipping an expired appearance, land on the first step of the next eligible post.
 * Returns null when there is no eligible post left (caller should exit playback once).
 */
export function findNextEligibleStepIndexAfter(
  steps: readonly SkywritePlayStep[],
  fromIndex: number,
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
  postsById?: ReadonlyMap<string, SkywriteRecord>,
): number | null {
  if (steps.length === 0 || fromIndex < 0 || fromIndex >= steps.length) return null;
  const order = uniqueSkywriteIdsInPlayOrder(steps);
  const currentId = steps[fromIndex]?.skywriteId;
  if (!currentId) return null;
  const segIdx = order.indexOf(currentId);
  if (segIdx < 0) return null;
  for (let s = segIdx + 1; s < order.length; s += 1) {
    const nextId = order[s]!;
    if (
      !isStepSkyReelAppearanceActive(
        { stepId: '', skywriteId: nextId, kind: 'text' },
        registry,
        nowMs,
        postsById,
      )
    ) {
      continue;
    }
    const nextStepIndex = steps.findIndex((step) => step.skywriteId === nextId);
    if (nextStepIndex >= 0) return nextStepIndex;
  }
  return null;
}

export type GuidedPlayExpiryTransition =
  | { kind: 'none' }
  | { kind: 'jump'; toIndex: number }
  | { kind: 'exit' };

/**
 * When the current step was active and becomes expired during playback, advance once.
 * Does not auto-skip posts that were already expired when the session started.
 */
export function resolveMidPlaybackExpiryTransition(
  steps: readonly SkywritePlayStep[],
  currentIndex: number,
  registry: PlaySkySequenceRegistry,
  previousWasActive: boolean | null,
  nowActive: boolean,
  nowMs = Date.now(),
): GuidedPlayExpiryTransition {
  if (previousWasActive == null) return { kind: 'none' };
  if (!previousWasActive || nowActive) return { kind: 'none' };
  const next = findNextEligibleStepIndexAfter(steps, currentIndex, registry, nowMs);
  if (next == null) return { kind: 'exit' };
  return { kind: 'jump', toIndex: next };
}
