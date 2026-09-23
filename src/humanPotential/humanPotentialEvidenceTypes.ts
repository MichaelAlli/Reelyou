/** Hero Metrics evidence — provenance only, not UI counters. */
export type HumanPotentialEvidenceType = 'learning' | 'application' | 'impact' | 'ripple';

export type HumanPotentialEvidenceSourceType =
  | 'reflection'
  | 'saved_thread'
  | 'contribution';

export interface HumanPotentialEvidenceRecord {
  evidenceId: string;
  userId: string;
  evidenceType: HumanPotentialEvidenceType;
  sourceType: HumanPotentialEvidenceSourceType;
  sourceId: string;
  savedThreadId?: string;
  reflectionId?: string;
  sourceSkywriteId?: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  impactEventId?: string;
  rippleEventId?: string;
  applicationEvidenceId?: string;
  createdAt: number;
  userConfirmed: boolean;
  confidence?: 'user_confirmed';
  visibility: 'private';
  note?: string;
}

export function evidenceIdFor(reflectionId: string, evidenceType: HumanPotentialEvidenceType): string {
  return `ev-${evidenceType}-${reflectionId}`;
}
