/**
 * @deprecated Import from `@/moderation/moderationReportService` — kept for transitional imports.
 */
import { submitModerationReport } from '@/moderation/moderationReportService';
import type {
  ModerationReportReason,
  ModerationReportTargetType,
  SubmitModerationReportResult,
} from '@/moderation/moderationTypes';
import { currentUser } from '@/data/mockData';

export type SafetyReportReason = ModerationReportReason;
export type SafetyReportTargetType = ModerationReportTargetType;

export interface SafetyReportResult {
  ok: boolean;
  localOnly: true;
  reportId: string;
  duplicate?: boolean;
}

export async function reportUserSafety(params: {
  reportedUserId: string;
  threadId?: string;
  messageId?: string;
  reason?: ModerationReportReason;
  optionalNote?: string;
}): Promise<SafetyReportResult> {
  const result = await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: 'user',
    targetId: params.reportedUserId,
    targetOwnerUserId: params.reportedUserId,
    reason: params.reason ?? 'other',
    optionalNote: params.optionalNote,
    threadId: params.threadId,
    messageId: params.messageId,
    provenanceIds: params.messageId ? [params.messageId] : [],
    visibilityContext: 'profile_or_message',
  });
  return mapResult(result);
}

export async function reportCommunityTargetSafety(params: {
  targetType: Exclude<ModerationReportTargetType, 'user' | 'skywrite' | 'message'>;
  communityId: string;
  postId?: string;
  replyId?: string;
  reportedUserId?: string;
  reason?: ModerationReportReason;
  optionalNote?: string;
}): Promise<SafetyReportResult> {
  const targetId =
    params.targetType === 'community'
      ? params.communityId
      : params.targetType === 'community_post'
        ? (params.postId ?? params.communityId)
        : (params.replyId ?? params.postId ?? params.communityId);
  const result = await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: params.targetType,
    targetId,
    targetOwnerUserId: params.reportedUserId,
    reason: params.reason ?? 'other',
    optionalNote: params.optionalNote,
    communityId: params.communityId,
    postId: params.postId,
    replyId: params.replyId,
    provenanceIds: [params.communityId, params.postId, params.replyId].filter(Boolean) as string[],
    visibilityContext: 'community',
  });
  return mapResult(result);
}

function mapResult(result: SubmitModerationReportResult): SafetyReportResult {
  if (!result.ok) {
    return { ok: false, localOnly: true, reportId: '' };
  }
  return {
    ok: true,
    localOnly: true,
    reportId: result.reportId,
    duplicate: result.duplicate,
  };
}
