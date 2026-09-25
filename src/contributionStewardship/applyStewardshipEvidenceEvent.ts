import { computeStewardshipState } from '@/contributionStewardship/computeStewardshipState';
import type { ContributionStewardshipStore } from '@/contributionStewardship/stewardshipStore';
import type {
  ContributionAvailabilityPreference,
  ContributionStewardshipEvidence,
  StewardshipEvidenceType,
} from '@/contributionStewardship/stewardshipTypes';
import { buildStewardshipEvidenceDedupeId } from '@/contributionStewardship/stewardshipDedupe';

export interface StewardshipEvidenceEvent {
  contributorUserId: string;
  skyAreaId: string;
  contributionId: string;
  evidenceType: StewardshipEvidenceType;
  sourceId: string;
  occurredAt: number;
  provenanceIds?: string[];
  recipientUserId?: string;
}

export function applyStewardshipEvidenceEvent(
  store: ContributionStewardshipStore,
  event: StewardshipEvidenceEvent,
  invitationPreference?: ContributionAvailabilityPreference,
) {
  const id = buildStewardshipEvidenceDedupeId(event);
  if (store.hasEvidence(id)) {
    return { evidence: null, state: store.getAreaState(event.contributorUserId, event.skyAreaId) };
  }

  const evidence: ContributionStewardshipEvidence = {
    id,
    contributorUserId: event.contributorUserId,
    skyAreaId: event.skyAreaId,
    contributionId: event.contributionId,
    evidenceType: event.evidenceType,
    sourceId: event.sourceId,
    occurredAt: event.occurredAt,
    privacyScope: 'routing_internal',
    provenanceIds: event.provenanceIds ?? [event.sourceId],
    recipientUserId: event.recipientUserId,
  };

  store.appendEvidence(evidence);
  const areaEvidence = store.listEvidenceForArea(event.contributorUserId, event.skyAreaId);
  const state = computeStewardshipState({
    contributorUserId: event.contributorUserId,
    skyAreaId: event.skyAreaId,
    evidence: areaEvidence,
    invitationPreference,
  });
  store.setAreaState(state);
  return { evidence, state };
}
