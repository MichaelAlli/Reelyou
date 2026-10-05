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
