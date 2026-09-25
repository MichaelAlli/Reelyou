/** Bridge canonical community events into Reelyou Signal Center without a duplicate notification system. */

import { isCommunitySignalsMuted } from '@/emergingConstellations/communitySignalMuteRegistry';

export interface CommunityMeaningfulSignalItem {
  signalId: string;
  userId: string;
  type: 'community_reply' | 'community_belonging' | 'emerging_constellation_available';
  title: string;
  description: string;
  createdAt: number;
  communityId: string;
  postId?: string;
  destinationRoute: string;
  destinationParams: Record<string, string>;
}

const outbox: CommunityMeaningfulSignalItem[] = [];

export function pushCommunityMeaningfulSignal(item: CommunityMeaningfulSignalItem): void {
  if (outbox.some((entry) => entry.signalId === item.signalId)) return;
  outbox.push(item);
  if (outbox.length > 40) outbox.shift();
}

export function listCommunityMeaningfulSignalsForUser(userId: string): CommunityMeaningfulSignalItem[] {
  return outbox.filter(
    (entry) => entry.userId === userId && !isCommunitySignalsMuted(entry.communityId),
  );
}

export function clearCommunityMeaningfulSignalsForTests(): void {
  outbox.length = 0;
}
