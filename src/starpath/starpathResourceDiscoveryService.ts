import type { OpportunityCandidate, FreshnessStatus } from '@/starpath/starpathOpportunityTypes';
import type { ResourceDiscoveryContext, ResourceProviderAdapter } from '@/starpath/starpathResourceProviderTypes';
import { FIXTURE_ANCHOR_MS, FIXTURE_OPPORTUNITY_CATALOG } from '@/starpath/starpathResourceFixtures';
import { RESOURCE_PROVIDER_ADAPTERS } from '@/starpath/starpathResourceProviderTypes';
import { OPPORTUNITY_ESCALATION } from '@/starpath/starpathResourceConfig';
import { registerStarpathBackendProviders } from '@/starpath/providers/registerBackendProviders';
import {
  discoverReellyouPeopleCandidates,
  type ReellyouPeopleDiscoveryInput,
} from '@/starpath/starpathReellyouPeopleDiscovery';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';

export type ResourceProviderStatus =
  | 'fixture_only'
  | 'local'
  | 'live_future'
  | 'live'
  | 'cached'
  | 'degraded';

export interface ResourceDiscoveryResult {
  candidates: OpportunityCandidate[];
  providerStatus: ResourceProviderStatus;
  discoveryDiagnostics?: {
    liveCount: number;
    fixtureCount: number;
    peopleCount: number;
    checkedAt: number;
  };
}

export interface ResourceDiscoveryPeopleContext {
  viewerId: string;
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
}

function computeFreshness(candidate: OpportunityCandidate, now: number): FreshnessStatus {
  const deadline = candidate.deadline ?? candidate.registrationDeadline ?? candidate.expirationDate;
  if (candidate.expiresAt && now > candidate.expiresAt) return 'expired';
  if (deadline) {
    const remaining = deadline - now;
    if (remaining <= 0) return 'expired';
    if (remaining <= OPPORTUNITY_ESCALATION.expiringDeadlineMs) return 'approaching';
    if (remaining <= OPPORTUNITY_ESCALATION.soonDeadlineMs) return 'approaching';
  }
  if (candidate.endDate && now > candidate.endDate) return 'expired';
  return candidate.freshnessStatus;
}

/** FIXTURE-ONLY: shift time fields so catalog stays valid relative to `now`. */
function shiftFixtureCandidate(candidate: OpportunityCandidate, now: number): OpportunityCandidate {
  if (!candidate.fixtureOnly) return candidate;
  const delta = now - FIXTURE_ANCHOR_MS;
  const shift = (t?: number) => (typeof t === 'number' ? t + delta : undefined);
  return {
    ...candidate,
    startDate: shift(candidate.startDate),
    endDate: shift(candidate.endDate),
    applicationOpenDate: shift(candidate.applicationOpenDate),
    deadline: shift(candidate.deadline),
    registrationDeadline: shift(candidate.registrationDeadline),
    expirationDate: shift(candidate.expirationDate),
    expiresAt: shift(candidate.expiresAt),
    retrievedAt: now,
    lastVerifiedAt: now,
  };
}

function dedupeCandidates(list: OpportunityCandidate[]): OpportunityCandidate[] {
  const byKey = new Map<string, OpportunityCandidate>();
  for (const c of list) {
    const key = `${c.title.toLowerCase()}|${c.officialUrl ?? c.provider}`;
    if (!byKey.has(key)) byKey.set(key, c);
  }
  return [...byKey.values()];
}

async function fetchFromAdapters(ctx: ResourceDiscoveryContext): Promise<OpportunityCandidate[]> {
  const out: OpportunityCandidate[] = [];
  for (const adapter of RESOURCE_PROVIDER_ADAPTERS) {
    if (!adapter.fetchCandidates) continue;
    const batch = await adapter.fetchCandidates(ctx);
    out.push(...batch);
  }
  return out;
}

registerStarpathBackendProviders();

/** Fixture catalog + optional live backend + permitted Reelyou people suggestions. */
export async function discoverResourceCandidates(
  ctx: ResourceDiscoveryContext,
  peopleCtx?: ResourceDiscoveryPeopleContext,
): Promise<ResourceDiscoveryResult> {
  const fixture = FIXTURE_OPPORTUNITY_CATALOG.map((c) => {
    const shifted = shiftFixtureCandidate(c, ctx.now);
    return {
      ...shifted,
      freshnessStatus: computeFreshness(shifted, ctx.now),
      retrievedAt: ctx.now,
    };
  }).filter((c) => c.freshnessStatus !== 'expired');

  const adapterResults = await fetchFromAdapters(ctx);
  const liveFromBackend = adapterResults.filter((c) => !c.fixtureOnly);

  let peopleCandidates: OpportunityCandidate[] = [];
  if (peopleCtx) {
    const peopleInput: ReellyouPeopleDiscoveryInput = {
      viewerId: peopleCtx.viewerId,
      graph: peopleCtx.followGraph,
      blockedUserIds: peopleCtx.blockedUserIds,
      inputs: ctx.inputs,
      now: ctx.now,
    };
    peopleCandidates = discoverReellyouPeopleCandidates(peopleInput);
  }

  const merged = dedupeCandidates([...fixture, ...liveFromBackend, ...peopleCandidates]);

  let providerStatus: ResourceProviderStatus = 'fixture_only';
  if (liveFromBackend.length > 0) providerStatus = 'live';
  else if (adapterResults.length > 0) providerStatus = 'live_future';

  return {
    candidates: merged,
    providerStatus,
    discoveryDiagnostics: {
      liveCount: liveFromBackend.length,
      fixtureCount: fixture.length,
      peopleCount: peopleCandidates.length,
      checkedAt: ctx.now,
    },
  };
}

export function filterStaleAndUnverified(candidates: OpportunityCandidate[]): OpportunityCandidate[] {
  return candidates.filter(
    (c) => c.freshnessStatus !== 'expired' && c.freshnessStatus !== 'stale' && c.verificationStatus !== 'unverified',
  );
}
