import type { ModerationContentRecord } from '@/moderation/moderationContentRegistry';

/** QA fixture IDs — use in routes/tests, not hardcoded in UI components. */
export const SAFETY_FIXTURE_BLOCKED_USER_ID = 'community-fixture-morgan';
export const SAFETY_FIXTURE_LIMITED_USER_ID = 'orbit-3';
export const SAFETY_FIXTURE_REMOVED_SKYWRITE_ID = 'orbit-jordan-sw-connected';
export const SAFETY_FIXTURE_REPORTED_REPLY_ID = 'cpr-career-thread-1-a';

export const MODERATION_CONTENT_FIXTURES: readonly ModerationContentRecord[] = [
  {
    targetType: 'skywrite',
    targetId: SAFETY_FIXTURE_REMOVED_SKYWRITE_ID,
    disposition: 'removed',
    updatedAt: Date.now() - 86400_000,
    reportId: 'mod-fixture-skywrite-removed',
  },
  {
    targetType: 'reply',
    targetId: SAFETY_FIXTURE_REPORTED_REPLY_ID,
    disposition: 'removed',
    updatedAt: Date.now() - 3600_000,
    reportId: 'mod-fixture-reply-removed',
  },
];
