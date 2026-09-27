import { isEmergingConstellationDemoEnabled } from '@/constants/devFlags';
import type { UserPreferencesState } from '@/preferences/userPreferencesTypes';

/** Mirrors EmergingConstellationsProvider suggestion gating — no duplicate group logic. */
export function isEmergingConstellationDiscoveryEligible(
  preferences: UserPreferencesState,
): boolean {
  if (!isEmergingConstellationDemoEnabled()) return false;
  if (!preferences.discoveryPreferences.showOpportunityDiscovery) return false;
  return (
    preferences.personalizationPreferences.useActivityPatterns ||
    preferences.personalizationPreferences.useExplicitInterests
  );
}
