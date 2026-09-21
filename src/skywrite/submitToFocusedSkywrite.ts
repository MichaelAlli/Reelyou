import { buildSkyNodeId, type SkyArrivalHandoff } from '@/mySky/skyArrival';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

type SetHandoff = (handoff: SkyArrivalHandoff) => void;

/** Canonical post-submit path: shared star + Focused Skywrite Sky + arrival overlay. */
export function submitSkywriteToFocusedSky(
  record: SkywriteRecord,
  renderStarsSnapshot: MySkyStarDisplay[],
  setSkyArrivalHandoff: SetHandoff,
  router: { replace: (href: never) => void },
): void {
  setSkyArrivalHandoff({
    skywriteId: record.id,
    skyNodeId: buildSkyNodeId(record.id),
    justAddedToSky: true,
    skywriteStatus: 'animating',
    renderStarsSnapshot,
  });
  router.replace('/skywrite' as never);
}
