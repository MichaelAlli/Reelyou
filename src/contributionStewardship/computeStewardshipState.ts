import type {
  ContributionStewardshipEvidence,
  ContributionStewardshipEvidenceSummary,
  ContributionStewardshipState,
  ContributionAvailabilityPreference,
  StewardshipRoutingTrustBand,
} from '@/contributionStewardship/stewardshipTypes';
import { stewardshipWeightForEvidence } from '@/contributionStewardship/stewardshipEvidenceWeights';

function summarizeEvidence(
  rows: ContributionStewardshipEvidence[],
): ContributionStewardshipEvidenceSummary {
  const recipients = new Set<string>();
  let savedCount = 0;
  let helpfulCount = 0;
  let appliedCount = 0;
  let impactConfirmedCount = 0;
  let repeatRecipientTrustCount = 0;
  let negativeSignalCount = 0;

  for (const row of rows) {
    if (row.recipientUserId) recipients.add(row.recipientUserId);
    switch (row.evidenceType) {
      case 'saved':
        savedCount += 1;
        break;
      case 'helpful':
        helpfulCount += 1;
        break;
      case 'applied':
        appliedCount += 1;
        break;
      case 'impact_confirmed':
        impactConfirmedCount += 1;
        break;
      case 'repeat_recipient_trust':
        repeatRecipientTrustCount += 1;
        break;
      case 'moderation_negative':
        negativeSignalCount += 1;
        break;
      default:
        break;
    }
  }

  return {
    savedCount,
    helpfulCount,
    appliedCount,
    impactConfirmedCount,
    repeatRecipientTrustCount,
    negativeSignalCount,
    distinctRecipientCount: recipients.size,
  };
}

function trustBandFromScore(score: number, evidenceCount: number): StewardshipRoutingTrustBand {
  if (evidenceCount <= 0 || score <= 0) return 'new';
  if (score >= 18) return 'established';
  if (score >= 6) return 'developing';
  return 'new';
}

export function computeInternalRoutingScore(rows: ContributionStewardshipEvidence[]): number {
  let score = 0;
  const recipientHits = new Map<string, number>();

  for (const row of rows) {
    score += stewardshipWeightForEvidence(row.evidenceType);
    if (row.recipientUserId) {
      recipientHits.set(row.recipientUserId, (recipientHits.get(row.recipientUserId) ?? 0) + 1);
    }
  }

  for (const hits of recipientHits.values()) {
    if (hits > 1) {
      score += Math.min(3, hits - 1);
    }
  }

  return Math.max(0, score);
}

export function computeStewardshipState(input: {
  contributorUserId: string;
  skyAreaId: string;
  evidence: ContributionStewardshipEvidence[];
  invitationPreference?: ContributionAvailabilityPreference;
  now?: number;
}): ContributionStewardshipState {
  const summary = summarizeEvidence(input.evidence);
  const score = computeInternalRoutingScore(input.evidence);
  const routingTrustBand = trustBandFromScore(score, input.evidence.length);
  const routingEligibility =
    input.invitationPreference !== 'paused' &&
    input.invitationPreference !== 'area_paused' &&
    summary.negativeSignalCount < 3;

  return {
    contributorUserId: input.contributorUserId,
    skyAreaId: input.skyAreaId,
    evidenceSummary: summary,
    routingTrustBand,
    routingEligibility,
    invitationPreference: input.invitationPreference ?? 'keep_receiving',
    updatedAt: input.now ?? Date.now(),
  };
}

/** One signal among many — preserves newcomer exploration via low default weight. */
export function stewardshipRoutingBoost(state: ContributionStewardshipState): number {
  if (!state.routingEligibility) return 0;
  switch (state.routingTrustBand) {
    case 'established':
      return 0.18;
    case 'developing':
      return 0.1;
    default:
      return 0.04;
  }
}
