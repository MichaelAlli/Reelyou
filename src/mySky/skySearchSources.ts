import { orbitUsers } from '@/data/mockData';
import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

import { isPublicSkyAvailable, isPublicSkyDiscoverable } from './buildPublicSkyView';
import { resolvePublicSkyOwnerProfile } from './skyIdentity';
import type { SkyConnectionActivity } from './skyConnectionSources';
import {
  canViewPublicSky,
  resolveSkyVisibilitySettingsForOwner,
} from './skyVisibilitySettings';

export type SkySearchConnectionContext =
  | 'connected'
  | 'mutual'
  | 'shared-community'
  | 'discoverable';

export interface SkySearchResult {
  id: string;
  name: string;
  subtitle: string;
  bioLine: string;
  avatarInitials: string;
  avatarColor: string;
  avatarUri?: string | null;
  contextLabel: string;
  connectionContext: SkySearchConnectionContext;
  sharedCommunityName?: string;
  isConnected: boolean;
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

function resolveSharedCommunityName(
  actorId: string,
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
): string | undefined {
  for (const item of feed.items) {
    if (item.actorId !== actorId || !item.communityId) continue;
    const joined = communities.joined.find((entry) => entry.id === item.communityId);
    if (joined) return joined.name;
  }
  return undefined;
}

function connectionStatusFor(context: SkySearchConnectionContext): boolean {
  return context !== 'discoverable';
}

function resolveCanViewSky(actorId: string, connectionContext: SkySearchConnectionContext): boolean {
  if (!isPublicSkyAvailable(actorId)) return false;
  const settings = resolveSkyVisibilitySettingsForOwner(actorId);
  const isConnected = connectionContext !== 'discoverable';
  return canViewPublicSky(settings, isConnected);
}

function resolvePublicSkyId(
  actorId: string,
  connectionContext: SkySearchConnectionContext,
): string | null {
  if (!resolveCanViewSky(actorId, connectionContext)) return null;
  return actorId;
}

function enrichResult(
  base: Omit<
    SkySearchResult,
    'bioLine' | 'avatarUri' | 'sharedCommunityName' | 'isConnected' | 'canViewSky' | 'publicSkyId'
  >,
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
): SkySearchResult {
  const isConnected = connectionStatusFor(base.connectionContext);
  const profile = resolvePublicSkyOwnerProfile(
    base.id,
    isConnected ? 'connected' : 'none',
  );
  const sharedCommunityName =
    base.connectionContext === 'shared-community'
      ? resolveSharedCommunityName(base.id, feed, communities)
      : undefined;
  const canViewSky = resolveCanViewSky(base.id, base.connectionContext);

  return {
    ...base,
    bioLine: profile?.bio ?? profile?.subtitle ?? base.subtitle,
    avatarUri: profile?.avatarUri ?? null,
    sharedCommunityName,
    isConnected,
    canViewSky,
    publicSkyId: resolvePublicSkyId(base.id, base.connectionContext),
  };
}

/** My Sky discovery search — friends, connections, and public skies only. */
export function buildSkySearchResults(
  query: string,
  feed: AroundYourSkyHomeFeed,
  connectionActivities: SkyConnectionActivity[],
  communities: CommunitiesRecord,
  exploreEnabled = true,
): SkySearchResult[] {
  const catalog = new Map<string, SkySearchResult>();

  for (const user of orbitUsers) {
    const connectionContext = resolveConnectionContext(
      user.id,
      connectionActivities,
      feed,
      communities,
    );

    if (
      connectionContext === 'discoverable' &&
      !isPublicSkyDiscoverable(user.id)
    ) {
      continue;
    }

    catalog.set(
      user.id,
      enrichResult(
        {
          id: user.id,
          name: user.name,
          subtitle: user.label,
          avatarInitials: user.avatarInitials,
          avatarColor: user.avatarColor,
          connectionContext,
          contextLabel: CONTEXT_LABELS[connectionContext],
        },
        feed,
        communities,
      ),
    );
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

    if (
      connectionContext === 'discoverable' &&
      orbitMatch &&
      !isPublicSkyDiscoverable(orbitMatch.id)
    ) {
      continue;
    }

    catalog.set(
      item.actorId,
      enrichResult(
        {
          id: item.actorId,
          name: item.actorName,
          subtitle: item.preview ?? item.message,
          avatarInitials: item.actorInitials,
          avatarColor: item.actorColor,
          connectionContext,
          contextLabel: CONTEXT_LABELS[connectionContext],
        },
        feed,
        communities,
      ),
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const all = [...catalog.values()];

  const filtered = normalizedQuery
    ? all.filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.subtitle.toLowerCase().includes(normalizedQuery) ||
          entry.bioLine.toLowerCase().includes(normalizedQuery) ||
          entry.contextLabel.toLowerCase().includes(normalizedQuery) ||
          entry.sharedCommunityName?.toLowerCase().includes(normalizedQuery),
      )
    : all;

  const scoped = exploreEnabled
    ? filtered
    : filtered.filter((entry) => entry.connectionContext !== 'discoverable');

  return scoped
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
