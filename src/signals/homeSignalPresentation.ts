import type { ReelyouSignalsMetaState } from '@/signals/reelyouSignalTypes';
import type { AroundYourSkyDisplayItem } from '@/social/aroundYourSky/types';

/** Canonical signal ids tied to an Around Your Sky Home row. */
export function aroundYourSkyHomeSignalIds(item: AroundYourSkyDisplayItem): string[] {
  const ids: string[] = [`sig-ays-${item.id}`];
  if (item.destination === 'skywrite') {
    ids.push(`sig-sky-${item.id}`);
  }
  if (item.destination === 'community' && item.destinationParam) {
    ids.push(`sig-community-${item.id}`);
  }
  if (item.type === 'connection' && item.destination) {
    ids.push(`sig-conn-${item.id}`);
  }
  return [...new Set(ids)];
}

export function isHomePresentationHandled(
  meta: ReelyouSignalsMetaState,
  signalId: string,
): boolean {
  return (
    meta.dismissedSignalIds.includes(signalId) ||
    meta.acknowledgedSignalIds.includes(signalId)
  );
}

/** Home row hidden once any linked presentation signal was opened or dismissed. */
export function isAroundYourSkyItemHandledOnHome(
  meta: ReelyouSignalsMetaState,
  item: AroundYourSkyDisplayItem,
): boolean {
  const ids = aroundYourSkyHomeSignalIds(item);
  if (ids.length === 0) return false;
  return ids.some((id) => isHomePresentationHandled(meta, id));
}

export function filterAroundYourSkyForHome(
  items: readonly AroundYourSkyDisplayItem[],
  meta: ReelyouSignalsMetaState,
): AroundYourSkyDisplayItem[] {
  return items.filter((item) => !isAroundYourSkyItemHandledOnHome(meta, item));
}
