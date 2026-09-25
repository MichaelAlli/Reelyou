export type StewardshipEvidenceType =
  | 'saved'
  | 'helpful'
  | 'applied'
  | 'impact_confirmed'
  | 'repeat_recipient_trust'
  | 'relevant_lived_experience'
  | 'moderation_positive'
  | 'moderation_negative'
  | 'not_for_me';

export type StewardshipPrivacyScope = 'contributor_private' | 'routing_internal';

export type StewardshipRoutingTrustBand = 'new' | 'developing' | 'established';

export type ContributionAvailabilityPreference =
  | 'keep_receiving'
  | 'fewer'
  | 'paused'
  | 'area_paused';

export interface ContributionStewardshipEvidence {
  id: string;
  contributorUserId: string;
  skyAreaId: string;
  contributionId: string;
  evidenceType: StewardshipEvidenceType;
  sourceId: string;
  occurredAt: number;
  privacyScope: StewardshipPrivacyScope;
  provenanceIds: string[];
  recipientUserId?: string;
}

export interface ContributionStewardshipEvidenceSummary {
  savedCount: number;
  helpfulCount: number;
  appliedCount: number;
  impactConfirmedCount: number;
  repeatRecipientTrustCount: number;
  negativeSignalCount: number;
  distinctRecipientCount: number;
}

export interface ContributionStewardshipState {
  contributorUserId: string;
  skyAreaId: string;
  evidenceSummary: ContributionStewardshipEvidenceSummary;
  routingTrustBand: StewardshipRoutingTrustBand;
  routingEligibility: boolean;
  invitationPreference: ContributionAvailabilityPreference;
  updatedAt: number;
}

export type StewardshipPrivateSignalType =
  | 'CONTRIBUTION_STEWARDSHIP_EMERGING'
  | 'CONTRIBUTION_STEWARDSHIP_ESTABLISHED'
  | 'CONTRIBUTION_STEWARDSHIP_OPPORTUNITY';

export interface StewardshipPrivateRecognitionPayload {
  skyAreaId: string;
  recognitionType: StewardshipPrivateSignalType;
  message: string;
  contributionAvailabilityPrompt?: string;
  provenanceIds: string[];
}
