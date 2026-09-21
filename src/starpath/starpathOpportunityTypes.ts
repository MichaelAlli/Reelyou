export type OpportunityType =
  | 'event'
  | 'workshop'
  | 'grant'
  | 'funding'
  | 'audition'
  | 'class'
  | 'course'
  | 'community_program'
  | 'venue'
  | 'space'
  | 'app_tool'
  | 'mentor'
  | 'volunteer'
  | 'networking'
  | 'other';

export type FreshnessStatus = 'fresh' | 'approaching' | 'stale' | 'expired';
export type VerificationStatus = 'fixture' | 'verified' | 'unverified';
export type AvailabilityStatus = 'open' | 'closed' | 'unknown';

export type OpportunityReasonCode =
  | 'explicit_interest'
  | 'branch_alignment'
  | 'focus_alignment'
  | 'saved_context'
  | 'time_sensitive'
  | 'exploration_context';

export interface OpportunityCandidate {
  id: string;
  title: string;
  opportunityType: OpportunityType;
  provider: string;
  sourceName: string;
  sourceUrl?: string;
  officialUrl?: string;
  description: string;
  location?: string;
  remoteAvailable?: boolean;
  startDate?: number;
  endDate?: number;
  applicationOpenDate?: number;
  deadline?: number;
  registrationDeadline?: number;
  expirationDate?: number;
  cost?: string;
  eligibilitySummary?: string;
  categories: string[];
  relatedBranchIds: string[];
  relatedNodeIds: string[];
  reasonCodes: OpportunityReasonCode[];
  freshnessStatus: FreshnessStatus;
  verificationStatus: VerificationStatus;
  retrievedAt: number;
  lastVerifiedAt?: number;
  expiresAt?: number;
  availabilityStatus: AvailabilityStatus;
  /** FIXTURE-ONLY when true — not live web data. */
  fixtureOnly: boolean;
}

export interface OpportunityTracking {
  surfacedAt?: number;
  firstSeenAt?: number;
  openedAt?: number;
  lastVisibleAt?: number;
  guideMentionedAt?: number;
  guideMentionCount: number;
}

export interface PlacedOpportunityNode {
  nodeId: string;
  candidateId: string;
  branchId: string;
  refX: number;
  refY: number;
  iconKey: string;
  ringColor: string;
  prominence: 'primary' | 'comparison' | 'hidden';
  tracking: OpportunityTracking;
}

export interface StarPathResourceState {
  resourceVersion: string;
  resourcesById: Record<string, OpportunityCandidate>;
  placedNodes: PlacedOpportunityNode[];
  activeResourceIds: string[];
  savedResourceIds: string[];
  dismissedResourceIds: string[];
  snoozedResourceUntil: Record<string, number>;
  staleResourceIds: string[];
  lastDiscoveryAt: number;
  providerStatus: 'fixture_only' | 'local' | 'live_future';
}

export const EMPTY_RESOURCE_STATE: StarPathResourceState = {
  resourceVersion: 'beta-v1',
  resourcesById: {},
  placedNodes: [],
  activeResourceIds: [],
  savedResourceIds: [],
  dismissedResourceIds: [],
  snoozedResourceUntil: {},
  staleResourceIds: [],
  lastDiscoveryAt: 0,
  providerStatus: 'fixture_only',
};
