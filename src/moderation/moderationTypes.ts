export type ModerationReportTargetType =
  | 'user'
  | 'skywrite'
  | 'community'
  | 'community_post'
  | 'reply'
  | 'message';

export type ModerationReportReason =
  | 'harassment_bullying'
  | 'hate_abusive'
  | 'threats_safety'
  | 'sexual_inappropriate'
  | 'spam_scam'
  | 'harmful_advice'
  | 'privacy_violation'
  | 'impersonation'
  | 'other';

export type ModerationReportStatus = 'submitted' | 'under_review' | 'actioned' | 'closed';

export type ModerationResolution =
  | 'no_action'
  | 'content_hidden'
  | 'content_removed'
  | 'interaction_restricted'
  | 'user_warned'
  | 'account_restricted'
  | 'account_suspended';

export interface ModerationReport {
  id: string;
  reporterUserId: string;
  targetType: ModerationReportTargetType;
  targetId: string;
  targetOwnerUserId?: string;
  reason: ModerationReportReason;
  optionalNote?: string;
  createdAt: number;
  visibilityContext?: string;
  provenanceIds: readonly string[];
  status: ModerationReportStatus;
  reviewedAt?: number;
  resolution?: ModerationResolution;
  moderationMetadata?: {
    aiSuggestedSeverity?: 'low' | 'medium' | 'high';
    aiSuggestedCategory?: ModerationReportReason;
    duplicateOfReportId?: string;
    reviewerNote?: string;
  };
  /** Thread / community context — not full private history. */
  threadId?: string;
  messageId?: string;
  communityId?: string;
  postId?: string;
  replyId?: string;
  skywriteId?: string;
}

export interface SubmitModerationReportInput {
  reporterUserId: string;
  targetType: ModerationReportTargetType;
  targetId: string;
  targetOwnerUserId?: string;
  reason: ModerationReportReason;
  optionalNote?: string;
  visibilityContext?: string;
  provenanceIds?: readonly string[];
  threadId?: string;
  messageId?: string;
  communityId?: string;
  postId?: string;
  replyId?: string;
  skywriteId?: string;
}

export type SubmitModerationReportResult =
  | { ok: true; localOnly: true; reportId: string; duplicate: false }
  | { ok: true; localOnly: true; reportId: string; duplicate: true }
  | { ok: false; localOnly: true; error: 'storage_failed' | 'target_missing' };
