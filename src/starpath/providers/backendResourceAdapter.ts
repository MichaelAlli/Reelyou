import { fetchLiveResourceCandidates } from '@/backend/starpathBackendClient';
import type { ResourceDiscoveryContext } from '@/starpath/starpathResourceProviderTypes';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';

export async function fetchBackendResourceCandidates(
  ctx: ResourceDiscoveryContext,
): Promise<OpportunityCandidate[]> {
  const keywordHints = [
    ...ctx.inputs.explicitGoalHints,
    ...ctx.inputs.recentExplicitInterests,
    ...(ctx.elevatedBranchId ? [ctx.elevatedBranchId] : []),
  ];
  const response = await fetchLiveResourceCandidates({
    keywordHints,
    branchIds: ctx.inputs.elevatedBranchIds,
    todayFocusText: ctx.todayFocusText ?? ctx.inputs.todayFocusText,
  });
  if (!response?.candidates?.length) return [];
  return response.candidates.map((c) => ({
    ...c,
    reasonCodes: [...(c.reasonCodes ?? [])],
    fixtureOnly: false,
  }));
}
