/** Normalized opportunity shape — mirrors client OpportunityCandidate (subset). */
export interface ServerOpportunityCandidate {
  id: string;
  title: string;
  opportunityType: string;
  provider: string;
  sourceName: string;
  sourceUrl?: string;
  officialUrl?: string;
  description: string;
  location?: string;
  remoteAvailable?: boolean;
  startDate?: number;
  endDate?: number;
  deadline?: number;
  categories: string[];
  relatedBranchIds: string[];
  relatedNodeIds: string[];
  reasonCodes: string[];
  freshnessStatus: 'fresh' | 'approaching' | 'stale' | 'expired';
  verificationStatus: 'fixture' | 'verified' | 'unverified';
  retrievedAt: number;
  lastVerifiedAt?: number;
  expiresAt?: number;
  availabilityStatus: 'open' | 'closed' | 'unknown';
  fixtureOnly: boolean;
  providerKey: string;
}

export interface DiscoverResourcesRequest {
  keywordHints?: string[];
  branchIds?: string[];
  todayFocusText?: string | null;
  now?: number;
}

export interface DiscoverResourcesResponse {
  candidates: ServerOpportunityCandidate[];
  providerStatus: 'live' | 'cached' | 'degraded' | 'empty';
  checkedAt: number;
  sourceNotes: string[];
  errors: string[];
}
