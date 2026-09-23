import { stableOpportunityNodeId } from '@/starpath/starpathOpportunityOrganizer';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

export interface ContributionBeaconSignalSource {
  signalId: string;
  skywriteId: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface ReelyouSignalSources {
  starpathResourceState: StarPathResourceState | null;
  homeFeed: AroundYourSkyHomeFeed | null;
  contributionBeacons?: ContributionBeaconSignalSource[];
}

export function starpathOpportunitySignalsFromState(
  resourceState: StarPathResourceState | null,
  now: number,
): Array<{
  signalId: string;
  nodeId: string;
  candidateId: string;
  title: string;
  description: string;
  createdAt: number;
  timeSensitive: boolean;
}> {
  if (!resourceState?.placedNodes?.length) return [];
  const out: Array<{
    signalId: string;
    nodeId: string;
    candidateId: string;
    title: string;
    description: string;
    createdAt: number;
    timeSensitive: boolean;
  }> = [];
  for (const node of resourceState.placedNodes.slice(0, 3)) {
    const candidate = resourceState.resourcesById[node.candidateId];
    if (!candidate) continue;
    if (resourceState.dismissedResourceIds.includes(candidate.id)) continue;
    const snoozeUntil = resourceState.snoozedResourceUntil[candidate.id] ?? 0;
    if (snoozeUntil > now) continue;
    out.push({
      signalId: `sig-opp-${node.nodeId}`,
      nodeId: node.nodeId,
      candidateId: candidate.id,
      title: candidate.title,
      description: candidate.description.slice(0, 120),
      createdAt: candidate.retrievedAt ?? now - 600_000,
      timeSensitive: Boolean(
        (candidate.deadline ?? candidate.expiresAt) &&
          (candidate.deadline ?? candidate.expiresAt ?? now) - now < 7 * 86400_000,
      ),
    });
  }
  return out;
}

export function communitySignalsFromFeed(
  feed: AroundYourSkyHomeFeed | null,
  now: number,
): Array<{
  signalId: string;
  communityId: string;
  title: string;
  description: string;
  createdAt: number;
}> {
  if (!feed?.items?.length) return [];
  return feed.items
    .filter((item) => item.destination === 'community' && item.destinationParam)
    .slice(0, 2)
    .map((item) => ({
      signalId: `sig-community-${item.id}`,
      communityId: item.destinationParam!,
      title: item.message,
      description: item.preview ?? 'Community activity',
      createdAt: new Date(item.timestamp).getTime() || now,
    }));
}

export function connectionSignalsFromFeed(
  feed: AroundYourSkyHomeFeed | null,
  now: number,
): Array<{
  signalId: string;
  title: string;
  description: string;
  createdAt: number;
  route: string;
}> {
  if (!feed?.items?.length) return [];
  return feed.items
    .filter((item) => item.type === 'connection' && item.destination)
    .slice(0, 2)
    .map((item) => ({
      signalId: `sig-conn-${item.id}`,
      title: item.message,
      description: item.preview ?? item.relativeTime,
      createdAt: new Date(item.timestamp).getTime() || now,
      route:
        item.destination === 'public-sky' && item.destinationParam
          ? `/public-sky?id=${item.destinationParam}`
          : item.destination === 'skywrite'
            ? '/skywrite'
            : '/home',
    }));
}

/** Saved StarPath resource revisit signal when user saved an opportunity. */
export function savedStarpathRevisitSignal(
  resourceState: StarPathResourceState | null,
  now: number,
): {
  signalId: string;
  nodeId: string;
  title: string;
  description: string;
  createdAt: number;
} | null {
  const savedId = resourceState?.savedResourceIds?.[0];
  if (!savedId || !resourceState) return null;
  const candidate = resourceState.resourcesById[savedId];
  if (!candidate) return null;
  const nodeId = stableOpportunityNodeId(savedId);
  return {
    signalId: `sig-saved-${savedId}`,
    nodeId,
    title: 'Saved opportunity to revisit',
    description: candidate.title,
    createdAt: now - 120_000,
  };
}
