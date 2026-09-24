import type { LegacyMomentPrivacy } from '@/legacy/legacyMomentTypes';

/** Playback sequence — references LegacyMoment ids only. */
export interface ReelSequence {
  sequenceId: string;
  ownerUserId: string;
  momentIds: readonly string[];
  generatedAt: number;
  periodStart: number | null;
  periodEnd: number | null;
  privacy: LegacyMomentPrivacy;
  userReviewed: boolean;
  createdAt: number;
}
