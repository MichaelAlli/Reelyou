import { buildSkyNodeId } from '@/mySky/skyArrival';
import { applyArrivalHighlight, buildMySkyViewFromSources, type MySkySources } from '@/mySky/mySkyState';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

/** Stars for arrival overlay — includes the just-published Skywrite with correct semantic color. */
export function buildArrivalStarsSnapshot(
  sources: MySkySources,
  record: SkywriteRecord,
  visibleLayers: MySkyVisibleLayers,
): MySkyStarDisplay[] {
  const posts = [record, ...sources.skywrites.filter((post) => post.id !== record.id)];
  const view = buildMySkyViewFromSources({ ...sources, skywrites: posts }, visibleLayers);
  return applyArrivalHighlight(view.stars, buildSkyNodeId(record.id));
}
