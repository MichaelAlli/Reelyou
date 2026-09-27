import type { ReelyouSignal } from '@/signals/reelyouSignalTypes';
import type { ReelyouSignalsMetaState } from '@/signals/reelyouSignalTypes';

function signalMatchesCommunity(signal: ReelyouSignal, communityId: string): boolean {
  if (signal.sourceId === communityId) return true;
  const paramId = signal.destinationParams?.id;
  return paramId === communityId;
}

function isActiveCommunitySignal(
  signal: ReelyouSignal,
  communityId: string,
  meta: ReelyouSignalsMetaState,
  now: number,
): boolean {
  if (signal.type !== 'communities') return false;
  if (!signalMatchesCommunity(signal, communityId)) return false;
  if (meta.dismissedSignalIds.includes(signal.signalId)) return false;
  if ((meta.snoozedUntil[signal.signalId] ?? 0) > now) return false;
  return true;
}

export function joinedGroupHasUnseenActivity(
  communityId: string,
  signals: readonly ReelyouSignal[],
  meta: ReelyouSignalsMetaState,
  now = Date.now(),
): boolean {
  return signals.some(
    (signal) =>
      !signal.read &&
      isActiveCommunitySignal(signal, communityId, meta, now),
  );
}

export function anyJoinedGroupHasUnseenActivity(
  communityIds: readonly string[],
  signals: readonly ReelyouSignal[],
  meta: ReelyouSignalsMetaState,
  now = Date.now(),
): boolean {
  return communityIds.some((id) => joinedGroupHasUnseenActivity(id, signals, meta, now));
}

/** Short navigation-only status — not a feed preview. */
export function joinedGroupStatusLine(
  communityId: string,
  signals: readonly ReelyouSignal[],
  meta: ReelyouSignalsMetaState,
  now = Date.now(),
): string {
  const active = signals.filter((signal) =>
    isActiveCommunitySignal(signal, communityId, meta, now),
  );
  const unread = active.filter((signal) => !signal.read);
  if (unread.length === 0) return 'Quiet right now';
  if (unread.some((signal) => signal.title.toLowerCase().includes('respond'))) {
    return 'New perspective';
  }
  if (unread.length === 1) return '1 new moment';
  return `${unread.length} new moments`;
}
