import type { ContributionAvailabilityPreference } from '@/contributionStewardship/stewardshipTypes';

export interface ContributionAvailabilitySettings {
  global: ContributionAvailabilityPreference;
  bySkyAreaId: Record<string, ContributionAvailabilityPreference>;
}

export const DEFAULT_CONTRIBUTION_AVAILABILITY: ContributionAvailabilitySettings = {
  global: 'keep_receiving',
  bySkyAreaId: {},
};

export function resolveEffectiveContributionAvailability(
  settings: ContributionAvailabilitySettings,
  skyAreaId: string,
): ContributionAvailabilityPreference {
  return settings.bySkyAreaId[skyAreaId] ?? settings.global;
}

export function withContributionAvailabilityUpdate(
  settings: ContributionAvailabilitySettings,
  skyAreaId: string,
  preference: ContributionAvailabilityPreference,
): ContributionAvailabilitySettings {
  return {
    ...settings,
    bySkyAreaId: { ...settings.bySkyAreaId, [skyAreaId]: preference },
  };
}
