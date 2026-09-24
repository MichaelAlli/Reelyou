import { canViewerSeeLegacyItem, isLegacyViewerBlocked } from '@/legacy/legacyViewerAccess';
import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const moment: LegacyMoment = {
  legacyMomentId: 'm1',
  ownerUserId: 'owner-a',
  sourceType: 'impact_event',
  sourceId: 'e1',
  eventType: 'impact',
  occurredAt: 1,
  title: 'T',
  shortSummary: 'S',
  privacy: 'public',
  userApproved: true,
  userEdited: false,
  userHidden: false,
  sortOrder: 0,
  createdAt: 1,
  updatedAt: 1,
  dimension: 'impact',
};

const ctx = {
  subjectUserId: 'owner-a',
  viewerUserId: 'viewer-b',
  followGraph: EMPTY_SKY_FOLLOW_GRAPH,
  blockedUserIds: [] as string[],
};

assert(canViewerSeeLegacyItem(moment, ctx), 'public legacy visible');
assert(
  !canViewerSeeLegacyItem({ ...moment, privacy: 'private' }, ctx),
  'private legacy hidden',
);
assert(
  isLegacyViewerBlocked({ ...ctx, blockedUserIds: ['owner-a'] }),
  'block overrides',
);

console.log('legacyViewerAccess.test.ts — OK');
