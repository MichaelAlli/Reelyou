import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';

export type ResourceProviderKey =
  | 'fixture_catalog'
  | 'web_search'
  | 'events_api'
  | 'grants_api'
  | 'places_api'
  | 'education_api'
  | 'partner_plugin';

export interface ResourceDiscoveryContext {
  now: number;
  inputs: StarPathGuidanceSafeInputs;
  elevatedBranchId?: string | null;
  todayFocusText?: string | null;
}

export interface ResourceProviderAdapter {
  providerKey: ResourceProviderKey;
  /** Returns normalized candidates — live adapters implemented server-side later. */
  fetchCandidates?: (ctx: ResourceDiscoveryContext) => Promise<OpportunityCandidate[]>;
}

/** Registered providers — only fixture_catalog is active in Beta client. */
export const RESOURCE_PROVIDER_ADAPTERS: ResourceProviderAdapter[] = [];
