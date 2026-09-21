import type { OpportunityCandidate, OpportunityReasonCode } from '@/starpath/starpathOpportunityTypes';
import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { OPPORTUNITY_ESCALATION, RESOURCE_OVERLOAD_GUARDRAILS } from '@/starpath/starpathResourceConfig';

function scoreCandidate(
  c: OpportunityCandidate,
  inputs: StarPathGuidanceSafeInputs,
  now: number,
): number {
  let score = 0;
  const reasons: OpportunityReasonCode[] = [];

  for (const branchId of c.relatedBranchIds) {
    if (inputs.elevatedBranchIds.includes(branchId)) {
      score += 0.35;
      reasons.push('branch_alignment');
    }
    if (inputs.recentExplicitInterests.some((id) => c.relatedNodeIds.includes(id))) {
      score += 0.45;
      reasons.push('explicit_interest');
    }
  }

  if (inputs.todayFocusText) {
    const focus = inputs.todayFocusText.toLowerCase();
    if (c.categories.some((cat) => focus.includes(cat))) {
      score += 0.2;
      reasons.push('focus_alignment');
    }
  }

  if (c.deadline) {
    const remaining = c.deadline - now;
    if (remaining > 0 && remaining <= OPPORTUNITY_ESCALATION.soonDeadlineMs) {
      score += 0.25;
      reasons.push('time_sensitive');
    }
  }

  c.reasonCodes = [...new Set([...c.reasonCodes, ...reasons])];
  return score;
}

/** Deterministic sift: many candidates → small strong set (no randomness). */
export function siftOpportunityCandidates(
  raw: OpportunityCandidate[],
  inputs: StarPathGuidanceSafeInputs,
  dismissedIds: string[],
  now: number,
  snoozedUntil: Record<string, number> = {},
): OpportunityCandidate[] {
  const eligible = raw.filter(
    (c) => !dismissedIds.includes(c.id) && (snoozedUntil[c.id] ?? 0) <= now,
  );
  const scored = eligible
    .map((c) => {
      const copy = { ...c, reasonCodes: [...c.reasonCodes] };
      return { c: copy, score: scoreCandidate(copy, inputs, now) };
    })
    .sort((a, b) => b.score - a.score || a.c.id.localeCompare(b.c.id));

  const max =
    RESOURCE_OVERLOAD_GUARDRAILS.maxPrimaryResources + RESOURCE_OVERLOAD_GUARDRAILS.maxComparisonResources;
  return scored.slice(0, max).map((s) => s.c);
}
