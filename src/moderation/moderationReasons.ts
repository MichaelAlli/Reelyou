import type { ModerationReportReason } from '@/moderation/moderationTypes';

export interface ModerationReasonOption {
  id: ModerationReportReason;
  label: string;
}

export const MODERATION_REASON_OPTIONS: readonly ModerationReasonOption[] = [
  { id: 'harassment_bullying', label: 'Harassment or bullying' },
  { id: 'hate_abusive', label: 'Hate or abusive behavior' },
  { id: 'threats_safety', label: 'Threats or safety concern' },
  { id: 'sexual_inappropriate', label: 'Sexual or inappropriate content' },
  { id: 'spam_scam', label: 'Spam or scam' },
  { id: 'harmful_advice', label: 'Misleading or harmful advice' },
  { id: 'privacy_violation', label: 'Privacy violation' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Something else' },
];

export function moderationReasonLabel(reason: ModerationReportReason): string {
  return MODERATION_REASON_OPTIONS.find((entry) => entry.id === reason)?.label ?? 'Something else';
}

/** Reasons that may affect stewardship routing safety — not “Not for me” or casual disagreement. */
export const CREDIBLE_STEWARDSHIP_SAFETY_REASONS: ReadonlySet<ModerationReportReason> = new Set([
  'harassment_bullying',
  'hate_abusive',
  'threats_safety',
  'sexual_inappropriate',
  'impersonation',
]);
