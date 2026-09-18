import { orbitUsers } from '@/data/mockData';
import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

import type { SkyConnectionActivity } from './skyConnectionSources';

export type SkySearchConnectionContext =
  | 'connected'
  | 'mutual'
  | 'shared-community'
  | 'discoverable';

export interface SkySearchResult {
  id: string;
  name: string;
  subtitle: string;
  avatarInitials: string;
  avatarColor: string;
  contextLabel: string;
  connectionContext: SkySearchConnectionContext;
  publicSkyId: string | null;
  canViewSky: boolean;
}

const CONTEXT_LABELS: Record<SkySearchConnectionContext, string> = {
  connected: 'Connected',
  mutual: 'Mutual connection',
  'shared-community': 'Shared community',
  discoverable: 'Public Sky',
};

function resolveConnectionContext(
  actorId: string,
  connectionActivities: SkyConnectionActivity[],
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
): SkySearchConnectionContext {
  const activity = connectionActivities.find((entry) => entry.actorId === actorId);
  if (activity) {
    return 'connected';
  }

  const feedHits = feed.items.filter((item) => item.actorId === actorId);
  if (feedHits.some((item) => item.type === 'connection' || item.type === 'social')) {
    return 'connected';
  }

  if (feedHits.some((item) => item.type === 'community' && item.communityId)) {
    const communityId = feedHits.find((item) => item.communityId)?.communityId;
    if (communityId && communities.joined.some((entry: { id: string }) => entry.id === communityId)) {
      return 'shared-community';
    }
  }

  if (
    feedHits.length >= 2 &&
    feedHits.some((item) => item.relevanceSource === 'connection')
  ) {
    return 'mutual';
  }

  return 'discoverable';
}

/** My Sky discovery search — friends, connections, and public skies only. */
export function buildSkySearchResults(
  query: string,
  feed: AroundYourSkyHomeFeed,
  connectionActivities: SkyConnectionActivity[],
  communities: CommunitiesRecord,
): SkySearchResult[] {
  const catalog = new Map<string, SkySearchResult>();

  for (const user of orbitUsers) {
    const connectionContext = resolveConnectionContext(
      user.id,
      connectionActivities,
      feed,
      communities,
    );

    catalog.set(user.id, {
      id: user.id,
      name: user.name,
      subtitle: user.label,
      avatarInitials: user.avatarInitials,
      avatarColor: user.avatarColor,
      connectionContext,
      contextLabel: CONTEXT_LABELS[connectionContext],
      publicSkyId: user.id,
      canViewSky: true,
    });
  }

  for (const item of feed.items) {
    if (!item.actorId || catalog.has(item.actorId)) continue;

    const connectionContext = resolveConnectionContext(
      item.actorId,
      connectionActivities,
      feed,
      communities,
    );
    const orbitMatch = orbitUsers.find((user) => user.id === item.actorId);

    catalog.set(item.actorId, {
      id: item.actorId,
      name: item.actorName,
      subtitle: item.preview ?? item.message,
      avatarInitials: item.actorInitials,
      avatarColor: item.actorColor,
      connectionContext,
      contextLabel: CONTEXT_LABELS[connectionContext],
      publicSkyId:
        item.destination === 'public-sky' ? item.destinationParam : orbitMatch?.id ?? null,
      canViewSky: Boolean(orbitMatch ?? item.destination === 'public-sky'),
    });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const all = [...catalog.values()];

  const filtered = normalizedQuery
    ? all.filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.subtitle.toLowerCase().includes(normalizedQuery) ||
          entry.contextLabel.toLowerCase().includes(normalizedQuery),
      )
    : all;

  return filtered
    .sort((a, b) => {
      const rank = (context: SkySearchConnectionContext) => {
        if (context === 'connected') return 0;
        if (context === 'mutual') return 1;
        if (context === 'shared-community') return 2;
        return 3;
      };
      return rank(a.connectionContext) - rank(b.connectionContext);
    })
    .slice(0, 24);
}
