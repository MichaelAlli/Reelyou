import { MySkyCopy } from '@/constants/mySkyCopy';
import { discoveryTierWeight, exploreResultCap } from '@/mySky/discoveryPreferencePolicy';
import type { DiscoveryPreferences } from '@/preferences/userPreferencesTypes';
import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

import type { SkyConnectionActivity } from './skyConnectionSources';
import {
  buildSkySearchResults,
  type SkySearchConnectionContext,
  type SkySearchResult,
} from './skySearchSources';

export type SkySearchGroupId = 'connected' | 'shared-community' | 'explore';

export interface SkySearchGroup {
  id: SkySearchGroupId;
  title: string;
  results: SkySearchResult[];
}

export type SearchResultActionKind = 'jump' | 'view-sky' | 'view-profile' | 'connect' | 'connected';

export interface SearchResultAction {
  kind: SearchResultActionKind;
  label: string;
  enabled: boolean;
}

export interface SearchResultActions {
  primary: SearchResultAction;
  secondary?: SearchResultAction;
}

function isConnectedContext(context: SkySearchConnectionContext): boolean {
  return context === 'connected' || context === 'mutual' || context === 'shared-community';
}

/** Filter and group discovery results for the Search sheet. */
export function buildSkySearchDiscovery(
  query: string,
  feed: AroundYourSkyHomeFeed,
  connectionActivities: SkyConnectionActivity[],
  communities: CommunitiesRecord,
  exploreEnabled: boolean,
  discoveryPrefs?: DiscoveryPreferences,
): SkySearchGroup[] {
  const prefs: DiscoveryPreferences = discoveryPrefs ?? {
    includePublicSkiesInExplore: true,
    prioritizeConnections: true,
    prioritizeSharedCommunities: true,
    showOpportunityDiscovery: true,
    reduceDiscoverySuggestions: false,
  };
  const results = buildSkySearchResults(
    query,
    feed,
    connectionActivities,
    communities,
    exploreEnabled,
  );

  const connected = results.filter(
    (entry) => entry.connectionContext === 'connected' || entry.connectionContext === 'mutual',
  );
  const sharedCommunity = results.filter((entry) => entry.connectionContext === 'shared-community');
  const explore = results.filter((entry) => entry.connectionContext === 'discoverable');

  const groups: SkySearchGroup[] = [];

  if (connected.length > 0) {
    groups.push({ id: 'connected', title: MySkyCopy.searchGroupConnected, results: connected });
  }
  if (sharedCommunity.length > 0) {
    groups.push({
      id: 'shared-community',
      title: MySkyCopy.searchGroupSharedCommunities,
      results: sharedCommunity,
    });
  }
  if (exploreEnabled && explore.length > 0) {
    const cap = exploreResultCap(prefs);
    groups.push({
      id: 'explore',
      title: MySkyCopy.searchGroupExplore,
      results: explore.slice(0, cap),
    });
  }

  return groups.sort(
    (a, b) => discoveryTierWeight(b.id, prefs) - discoveryTierWeight(a.id, prefs),
  );
}

/** Primary + secondary actions — never overload every result. */
export function resolveSearchResultActions(
  result: SkySearchResult,
  canJumpToSky: boolean,
): SearchResultActions {
  const connected = isConnectedContext(result.connectionContext);

  if (connected) {
    if (canJumpToSky) {
      return {
        primary: { kind: 'jump', label: MySkyCopy.searchJumpToSky, enabled: true },
        secondary: { kind: 'view-profile', label: MySkyCopy.searchViewProfile, enabled: true },
      };
    }
    if (result.canViewSky) {
      return {
        primary: { kind: 'view-sky', label: MySkyCopy.searchViewSky, enabled: true },
        secondary: { kind: 'view-profile', label: MySkyCopy.searchViewProfile, enabled: true },
      };
    }
    return {
      primary: { kind: 'view-profile', label: MySkyCopy.searchViewProfile, enabled: true },
    };
  }

  if (result.connectionContext === 'discoverable') {
    if (result.canViewSky) {
      return {
        primary: { kind: 'view-sky', label: MySkyCopy.searchViewSky, enabled: true },
        secondary: canJumpToSky
          ? { kind: 'jump', label: MySkyCopy.searchJumpToSky, enabled: true }
          : { kind: 'connect', label: MySkyCopy.identityConnect, enabled: true },
      };
    }
    return {
      primary: { kind: 'view-profile', label: MySkyCopy.searchViewProfile, enabled: true },
      secondary: { kind: 'connect', label: MySkyCopy.identityConnect, enabled: true },
    };
  }

  return {
    primary: { kind: 'view-profile', label: MySkyCopy.searchViewProfile, enabled: true },
  };
}

export function searchResultCount(groups: SkySearchGroup[]): number {
  return groups.reduce((total, group) => total + group.results.length, 0);
}
