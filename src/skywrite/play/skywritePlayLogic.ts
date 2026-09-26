import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';
import type {
  FocusedSkyPlaySequenceConfig,
  SingleSkywritePlayConfig,
  SkywritePlayStep,
  SkywritePlayStepKind,
} from '@/skywrite/play/skywritePlayTypes';

const STEP_KIND_ORDER: SkywritePlayStepKind[] = ['text', 'photo', 'audio'];

function stepIdFor(kind: SkywritePlayStepKind): string {
  return kind;
}

export function defaultStepsForSkywrite(skywrite: SkywriteRecord): SkywritePlayStep[] {
  const steps: SkywritePlayStep[] = [];
  if (skywrite.text.trim()) {
    steps.push({
      stepId: stepIdFor('text'),
      skywriteId: skywrite.id,
      kind: 'text',
    });
  }
  if (skywrite.media.photo?.uri) {
    steps.push({
      stepId: stepIdFor('photo'),
      skywriteId: skywrite.id,
      kind: 'photo',
    });
  }
  if (skywrite.media.audio?.uri) {
    steps.push({
      stepId: stepIdFor('audio'),
      skywriteId: skywrite.id,
      kind: 'audio',
    });
  }
  if (steps.length === 0) {
    steps.push({
      stepId: stepIdFor('text'),
      skywriteId: skywrite.id,
      kind: 'text',
    });
  }
  return steps;
}

export function resolveStepsForSkywrite(
  skywrite: SkywriteRecord,
  config?: SingleSkywritePlayConfig,
): SkywritePlayStep[] {
  const defaults = defaultStepsForSkywrite(skywrite);
  if (!config) return defaults;

  const excluded = new Set(config.excludedStepIds);
  const filtered = defaults.filter((step) => !excluded.has(step.stepId));
  if (config.orderedStepIds.length === 0) return filtered;

  const byId = new Map(filtered.map((step) => [step.stepId, step]));
  const ordered: SkywritePlayStep[] = [];
  for (const id of config.orderedStepIds) {
    const step = byId.get(id);
    if (step) {
      ordered.push(step);
      byId.delete(id);
    }
  }
  for (const step of filtered) {
    if (byId.has(step.stepId)) ordered.push(step);
  }
  return ordered;
}

export function defaultFocusedSkywriteIds(
  stars: readonly MySkyStarDisplay[],
  skywrites: readonly SkywriteRecord[],
): string[] {
  const skywriteIds = new Set(
    stars.filter((star) => star.type === 'skywrite' && star.sourceId).map((star) => star.sourceId!),
  );
  return skywrites
    .filter((post) => skywriteIds.has(post.id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((post) => post.id);
}

export function resolveFocusedSkyPlaySteps(
  stars: readonly MySkyStarDisplay[],
  skywrites: readonly SkywriteRecord[],
  config: FocusedSkyPlaySequenceConfig,
  singleConfigs: Record<string, SingleSkywritePlayConfig>,
): SkywritePlayStep[] {
  const defaultOrder = defaultFocusedSkywriteIds(stars, skywrites);
  const excluded = new Set(config.excludedSkywriteIds);
  const order =
    config.orderedSkywriteIds.length > 0
      ? [
          ...config.orderedSkywriteIds.filter((id) => !excluded.has(id)),
          ...defaultOrder.filter(
            (id) => !excluded.has(id) && !config.orderedSkywriteIds.includes(id),
          ),
        ]
      : defaultOrder.filter((id) => !excluded.has(id));

  const byId = new Map(skywrites.map((post) => [post.id, post]));
  const out: SkywritePlayStep[] = [];
  for (const skywriteId of order) {
    const record = byId.get(skywriteId);
    if (!record) continue;
    out.push(...resolveStepsForSkywrite(record, singleConfigs[skywriteId]));
  }
  return out;
}

export function reorderIds(ids: readonly string[], id: string, direction: 'up' | 'down'): string[] {
  const list = [...ids];
  const index = list.indexOf(id);
  if (index < 0) return list;
  const swap = direction === 'up' ? index - 1 : index + 1;
  if (swap < 0 || swap >= list.length) return list;
  [list[index], list[swap]] = [list[swap], list[index]];
  return list;
}

export function toggleExcluded(list: readonly string[], id: string): string[] {
  const set = new Set(list);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  return [...set];
}

export function ensureFocusedOrder(
  config: FocusedSkyPlaySequenceConfig,
  defaultIds: readonly string[],
): string[] {
  if (config.orderedSkywriteIds.length > 0) {
    return [
      ...config.orderedSkywriteIds,
      ...defaultIds.filter((id) => !config.orderedSkywriteIds.includes(id)),
    ];
  }
  return [...defaultIds];
}

export function stepKindLabel(kind: SkywritePlayStepKind): string {
  switch (kind) {
    case 'photo':
      return 'Image';
    case 'audio':
      return 'Voice';
    default:
      return 'Reflection';
  }
}

/** Stable step ordering for editor UI. */
export function allStepKindsForEditor(): SkywritePlayStepKind[] {
  return STEP_KIND_ORDER;
}
