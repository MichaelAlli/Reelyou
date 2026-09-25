import type { ModerationReportReason } from '@/moderation/moderationTypes';

/** Non-authoritative AI assist — human review remains required for enforcement. */
export function suggestModerationTriage(input: {
  reason: ModerationReportReason;
  optionalNote?: string;
}): {
  suggestedSeverity: 'low' | 'medium' | 'high';
  suggestedCategory: ModerationReportReason;
  queuePriority: number;
} {
  const note = (input.optionalNote ?? '').toLowerCase();
  let suggestedSeverity: 'low' | 'medium' | 'high' = 'low';
  if (
    input.reason === 'threats_safety' ||
    input.reason === 'sexual_inappropriate' ||
    note.includes('kill') ||
    note.includes('hurt')
  ) {
    suggestedSeverity = 'high';
  } else if (
    input.reason === 'harassment_bullying' ||
    input.reason === 'hate_abusive' ||
    input.reason === 'impersonation'
  ) {
    suggestedSeverity = 'medium';
  }
  const queuePriority = suggestedSeverity === 'high' ? 100 : suggestedSeverity === 'medium' ? 50 : 10;
  return {
    suggestedSeverity,
    suggestedCategory: input.reason,
    queuePriority,
  };
}
