import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import type { ReelSequence } from '@/legacy/reelYouTypes';
import { reelSequenceIdFor } from '@/legacy/legacyMomentIds';

export interface BuildReelSequenceInput {
  ownerUserId: string;
  moments: readonly LegacyMoment[];
  periodStart?: number | null;
  periodEnd?: number | null;
  userReviewed?: boolean;
  now?: number;
}

/** Local REEL-YOU sequence — references moment ids only. */
export function buildReelSequence(input: BuildReelSequenceInput): ReelSequence {
  const now = input.now ?? Date.now();
  const visible = input.moments.filter((moment) => !moment.userHidden);
  const inPeriod = visible.filter((moment) => {
    if (input.periodStart != null && moment.occurredAt < input.periodStart) return false;
    if (input.periodEnd != null && moment.occurredAt > input.periodEnd) return false;
    return true;
  });
  const ordered = [...inPeriod].sort((a, b) => a.occurredAt - b.occurredAt);
  const periodStart =
    input.periodStart ??
    (ordered.length > 0 ? ordered[0]!.occurredAt : null);
  const periodEnd =
    input.periodEnd ??
    (ordered.length > 0 ? ordered[ordered.length - 1]!.occurredAt : null);

  return {
    sequenceId: reelSequenceIdFor(input.ownerUserId, now),
    ownerUserId: input.ownerUserId,
    momentIds: ordered.map((moment) => moment.legacyMomentId),
    generatedAt: now,
    periodStart,
    periodEnd,
    privacy: 'private',
    userReviewed: input.userReviewed ?? false,
    createdAt: now,
  };
}
