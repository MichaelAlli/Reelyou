import type { OpportunityCandidate, FreshnessStatus } from '@/starpath/starpathOpportunityTypes';
import type { ResourceDiscoveryContext, ResourceProviderAdapter } from '@/starpath/starpathResourceProviderTypes';
import { FIXTURE_ANCHOR_MS, FIXTURE_OPPORTUNITY_CATALOG } from '@/starpath/starpathResourceFixtures';
import { RESOURCE_PROVIDER_ADAPTERS } from '@/starpath/starpathResourceProviderTypes';
import { OPPORTUNITY_ESCALATION } from '@/starpath/starpathResourceConfig';

export interface ResourceDiscoveryResult {
  candidates: OpportunityCandidate[];
  providerStatus: 'fixture_only' | 'local' | 'live_future';
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

/** Client Beta: fixture catalog only. Live queries are future backend. */
export async function discoverResourceCandidates(ctx: ResourceDiscoveryContext): Promise<ResourceDiscoveryResult> {
  const fixture = FIXTURE_OPPORTUNITY_CATALOG.map((c) => {
    const shifted = shiftFixtureCandidate(c, ctx.now);
    return {
      ...shifted,
      freshnessStatus: computeFreshness(shifted, ctx.now),
      retrievedAt: ctx.now,
    };
  }).filter((c) => c.freshnessStatus !== 'expired');

  const adapterResults = await fetchFromAdapters(ctx);
  const merged = dedupeCandidates([...fixture, ...adapterResults.filter((c) => !c.fixtureOnly)]);

  const providerStatus =
    adapterResults.length > 0 && adapterResults.some((c) => !c.fixtureOnly)
      ? 'live_future'
      : 'fixture_only';

  return { candidates: merged, providerStatus };
}

export function filterStaleAndUnverified(candidates: OpportunityCandidate[]): OpportunityCandidate[] {
  return candidates.filter(
    (c) => c.freshnessStatus !== 'expired' && c.freshnessStatus !== 'stale' && c.verificationStatus !== 'unverified',
  );
}
