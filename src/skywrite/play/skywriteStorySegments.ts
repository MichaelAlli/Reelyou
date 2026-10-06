import type { SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';

/** Stable skywrite order for story progress (one segment per post). */
export function uniqueSkywriteIdsInPlayOrder(steps: readonly SkywritePlayStep[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const step of steps) {
    if (seen.has(step.skywriteId)) continue;
    seen.add(step.skywriteId);
    order.push(step.skywriteId);
  }
  return order;
}

export function resolveStorySegmentIndex(
  steps: readonly SkywritePlayStep[],
  stepIndex: number,
): number {
  if (steps.length === 0 || stepIndex < 0) return 0;
  const order = uniqueSkywriteIdsInPlayOrder(steps);
  const id = steps[stepIndex]?.skywriteId;
  if (!id) return 0;
  const idx = order.indexOf(id);
  return idx >= 0 ? idx : 0;
}

export function resolveStorySegmentCount(steps: readonly SkywritePlayStep[]): number {
  return uniqueSkywriteIdsInPlayOrder(steps).length;
}

/** First step index of the next Skywrite post in sequence (not the next slide within the same post). */
export function findNextStoryStepIndex(
  steps: readonly SkywritePlayStep[],
  stepIndex: number,
): number | null {
  if (steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) return null;
  const order = uniqueSkywriteIdsInPlayOrder(steps);
  const currentId = steps[stepIndex]?.skywriteId;
  if (!currentId) return null;
  const segIdx = order.indexOf(currentId);
  if (segIdx < 0 || segIdx >= order.length - 1) return null;
  const nextId = order[segIdx + 1]!;
  const nextStepIndex = steps.findIndex((step) => step.skywriteId === nextId);
  return nextStepIndex >= 0 ? nextStepIndex : null;
}

/** First step index of the previous Skywrite post in sequence. */
export function findPreviousStoryStepIndex(
  steps: readonly SkywritePlayStep[],
  stepIndex: number,
): number | null {
  if (steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) return null;
  const order = uniqueSkywriteIdsInPlayOrder(steps);
  const currentId = steps[stepIndex]?.skywriteId;
  if (!currentId) return null;
  const segIdx = order.indexOf(currentId);
  if (segIdx <= 0) return null;
  const prevId = order[segIdx - 1]!;
  const prevStepIndex = steps.findIndex((step) => step.skywriteId === prevId);
  return prevStepIndex >= 0 ? prevStepIndex : null;
}
