import { isSkywriteInYourJourney } from '@/skywrite/library/skywriteLibraryRetention';
import { resolveStepsForSkywrite } from '@/skywrite/play/skywritePlayLogic';
import type {
  FocusedSkyPlaySequenceConfig,
  SingleSkywritePlayConfig,
  SkywritePlayStep,
} from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function defaultJourneyOrder(skywrites: readonly SkywriteRecord[], ownerUserId: string): string[] {
  return skywrites
    .filter(
      (post) =>
        (post.authorId ?? ownerUserId) === ownerUserId && isSkywriteInYourJourney(post),
    )
    .sort(
      (a, b) =>
        (b.journeyAddedAtMs ?? (Date.parse(b.createdAt) || 0)) -
        (a.journeyAddedAtMs ?? (Date.parse(a.createdAt) || 0)),
    )
    .map((post) => post.id);
}

export function resolveJourneyPlaySteps(input: {
  skywrites: readonly SkywriteRecord[];
  ownerUserId: string;
  orderedSkywriteIds: readonly string[];
  singleConfigs: Record<string, SingleSkywritePlayConfig>;
}): SkywritePlayStep[] {
  const journeyIdSet = new Set(defaultJourneyOrder(input.skywrites, input.ownerUserId));
  const config: FocusedSkyPlaySequenceConfig = {
    orderedSkywriteIds: [...input.orderedSkywriteIds],
    excludedSkywriteIds: [],
  };
  const defaults = [...journeyIdSet];
  let order =
    config.orderedSkywriteIds.length > 0
      ? [
          ...config.orderedSkywriteIds.filter((id) => journeyIdSet.has(id)),
          ...defaults.filter((id) => !config.orderedSkywriteIds.includes(id)),
        ]
      : defaults;

  order = [...new Set(order)];
  const byId = new Map(input.skywrites.map((post) => [post.id, post]));
  const out: SkywritePlayStep[] = [];
  for (const skywriteId of order) {
    const record = byId.get(skywriteId);
    if (!record || !isSkywriteInYourJourney(record)) continue;
    out.push(...resolveStepsForSkywrite(record, input.singleConfigs[skywriteId]));
  }
  return out;
}
