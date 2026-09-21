import type { DiscoveryPreferences } from '@/preferences/userPreferencesTypes';

/** Session Explore toggle AND user preference — both must allow public discovery. */
export function resolveEffectiveExploreEnabled(
  sessionExploreEnabled: boolean,
  prefs: DiscoveryPreferences,
): boolean {
  if (!prefs.includePublicSkiesInExplore) return false;
  return sessionExploreEnabled;
}

export function exploreResultCap(prefs: DiscoveryPreferences): number {
  if (prefs.reduceDiscoverySuggestions) return 2;
  if (!prefs.showOpportunityDiscovery) return 3;
  return 6;
}

/** Re-order connected vs shared-community vs explore without exposing scores. */
export function discoveryTierWeight(
  tier: 'connected' | 'shared-community' | 'explore',
  prefs: DiscoveryPreferences,
): number {
  if (tier === 'connected') return prefs.prioritizeConnections ? 3 : 2;
  if (tier === 'shared-community') return prefs.prioritizeSharedCommunities ? 3 : 2;
  return prefs.reduceDiscoverySuggestions ? 0 : 1;
}
