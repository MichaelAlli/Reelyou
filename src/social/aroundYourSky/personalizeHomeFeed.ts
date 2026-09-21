import type { UserPreferencesState } from '@/preferences/userPreferencesTypes';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

/** Apply user preferences to Home feed slice — does not mutate source fixtures. */
export function personalizeAroundYourSkyFeed(
  feed: AroundYourSkyHomeFeed,
  preferences: UserPreferencesState,
): AroundYourSkyHomeFeed {
  let items = [...feed.items];

  if (!preferences.personalizationPreferences.useActivityPatterns) {
    items = items.filter(
      (item) => item.relevanceSource === 'connection' || item.type === 'connection',
    );
  }

  if (!preferences.personalizationPreferences.useExplicitInterests) {
    items = items.filter((item) => item.type !== 'community' || !item.communityId);
  }

  if (preferences.discoveryPreferences.reduceDiscoverySuggestions) {
    items = items.slice(0, 2);
  } else {
    items = items.slice(0, 3);
  }

  return { items, isQuiet: items.length === 0 };
}
