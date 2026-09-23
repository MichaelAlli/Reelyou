/** Canonical contribution — saved Skywrite response. Not Impact. */
export type ContributionState = 'active' | 'withdrawn';

export type ContributionType = 'skywrite_response';

export interface ContributionRecord {
  contributionId: string;
  responderId: string;
  sourceSkywriteId: string;
  sourceThreadId: string;
  sourceResponseId: string;
  skyAreaId: string;
  contributionType: ContributionType;
  state: ContributionState;
  createdAt: number;
  savedAt: number;
  withdrawnAt?: number;
}

export function contributionIdForResponse(skywriteId: string, responseId: string): string {
  return `contrib-${skywriteId}-${responseId}`;
}
