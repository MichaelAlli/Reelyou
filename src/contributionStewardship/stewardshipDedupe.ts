import type { StewardshipEvidenceEvent } from '@/contributionStewardship/applyStewardshipEvidenceEvent';

export function buildStewardshipEvidenceDedupeId(event: StewardshipEvidenceEvent): string {
  return [
    event.contributorUserId,
    event.skyAreaId,
    event.evidenceType,
    event.contributionId,
    event.sourceId,
  ].join('::');
}

/** Lightweight anti-gaming — cap duplicate recipient helpful spam in a window. */
export function shouldAcceptHelpfulEvidence(input: {
  existingRecipientHelpfulCount: number;
  maxPerRecipient?: number;
}): boolean {
  return input.existingRecipientHelpfulCount < (input.maxPerRecipient ?? 5);
}
