import type { StewardshipEvidenceType } from '@/contributionStewardship/stewardshipTypes';

/** Internal routing weights — never exposed as public score. */
export const STEWARDSHIP_EVIDENCE_WEIGHT: Record<StewardshipEvidenceType, number> = {
  impact_confirmed: 10,
  applied: 7,
  helpful: 4,
  saved: 3,
  repeat_recipient_trust: 3,
  relevant_lived_experience: 2,
  moderation_positive: 1,
  moderation_negative: -8,
  not_for_me: 0,
};

/** Explicitly zero-weight popularity proxies (documentation + guard). */
export const STEWARDSHIP_EXCLUDED_SIGNALS = [
  'follower_count',
  'likes',
  'views',
  'profile_visits',
  'post_volume',
  'message_volume',
  'response_speed',
  'invitation_answer_count_only',
  'community_size',
  'public_reach',
] as const;

export function stewardshipWeightForEvidence(type: StewardshipEvidenceType): number {
  return STEWARDSHIP_EVIDENCE_WEIGHT[type] ?? 0;
}
