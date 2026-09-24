import type { ContributionRecord } from '@/contributions/contributionTypes';
import type { ImpactEventRecord } from '@/humanPotential/humanPotentialModels';
import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import { isVisitorProfileBlocked } from '@/profile/resolveVisitorProfilePrivacy';
import { isMutualSkyFriends } from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import type { SkywriteRecord } from '@/skywrite/types';
import type { Privacy } from '@/types';
import { normalizeSkywriteVisibility } from '@/skywrite/skywriteVisibility';

export type LegacyViewerMode = 'owner' | 'visitor';

export interface LegacyViewerContext {
  subjectUserId: string;
  viewerUserId: string;
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
}

export function isLegacyViewerBlocked(ctx: LegacyViewerContext): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) return false;
  return isVisitorProfileBlocked(ctx.subjectUserId, [...ctx.blockedUserIds]);
}

export function viewerIsMutualSkyFriend(ctx: LegacyViewerContext): boolean {
  return isMutualSkyFriends(ctx.followGraph, ctx.viewerUserId, ctx.subjectUserId);
}

export function canViewerSeeLegacyItem(
  moment: LegacyMoment,
  ctx: LegacyViewerContext,
): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) {
    return moment.userApproved && !moment.userHidden;
  }
  if (isLegacyViewerBlocked(ctx)) return false;
  if (!moment.userApproved || moment.userHidden) return false;
  if (moment.privacy === 'public') return true;
  return false;
}

function skywriteForId(
  skywrites: readonly SkywriteRecord[],
  skywriteId?: string,
): SkywriteRecord | undefined {
  if (!skywriteId) return undefined;
  return skywrites.find((entry) => entry.id === skywriteId);
}

export function canViewerSeeImpactItem(
  event: ImpactEventRecord,
  ctx: LegacyViewerContext,
  skywrites: readonly SkywriteRecord[],
): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) return event.userConfirmed;
  if (isLegacyViewerBlocked(ctx)) return false;
  if (event.contributorUserId !== ctx.subjectUserId && event.impactedUserId !== ctx.subjectUserId) {
    return false;
  }
  if (!event.userConfirmed) return false;
  const source = skywriteForId(skywrites, event.sourceSkywriteId);
  if (!source) return false;
  return resolveSkywriteViewerAccess({
    viewerId: ctx.viewerUserId,
    authorId: ctx.subjectUserId,
    visibility: source.visibility,
    followGraph: ctx.followGraph,
    blockedUserIds: ctx.blockedUserIds,
  });
}

export function canViewerSeeContribution(
  contribution: ContributionRecord,
  ctx: LegacyViewerContext,
  skywrites: readonly SkywriteRecord[],
): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) {
    return contribution.responderId === ctx.subjectUserId && contribution.state === 'active';
  }
  if (isLegacyViewerBlocked(ctx)) return false;
  if (contribution.responderId !== ctx.subjectUserId || contribution.state !== 'active') {
    return false;
  }
  const source = skywriteForId(skywrites, contribution.sourceSkywriteId);
  if (!source) return false;
  return resolveSkywriteViewerAccess({
    viewerId: ctx.viewerUserId,
    authorId: ctx.subjectUserId,
    visibility: source.visibility,
    followGraph: ctx.followGraph,
    blockedUserIds: ctx.blockedUserIds,
  });
}

export function canViewerSeeReelScene(
  moment: LegacyMoment,
  ctx: LegacyViewerContext,
): boolean {
  return canViewerSeeLegacyItem(moment, ctx);
}

export function canViewerAccessVisitorLegacyRoutes(ctx: LegacyViewerContext): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) return true;
  return !isLegacyViewerBlocked(ctx);
}

export function resolveVisitorMetricDetailEligible(
  skyVisibility: Privacy,
  ctx: LegacyViewerContext,
): boolean {
  if (ctx.viewerUserId === ctx.subjectUserId) return true;
  if (isLegacyViewerBlocked(ctx)) return false;
  const level = normalizeSkywriteVisibility(skyVisibility);
  if (level === 'public') return true;
  if (level === 'sky_friends' && viewerIsMutualSkyFriend(ctx)) return true;
  return false;
}

export function privacySafePersonLabel(
  personUserId: string | undefined,
  userDirectory: Readonly<Record<string, string>>,
  canShowIdentity: boolean,
): string {
  if (!personUserId || !canShowIdentity) return 'A person they supported';
  return userDirectory[personUserId]?.split(' ')[0] ?? 'Someone';
}

export function filterReelMomentIdsForViewer(
  momentIds: readonly string[],
  moments: readonly LegacyMoment[],
  ctx: LegacyViewerContext,
): string[] {
  const momentById = new Map(moments.map((moment) => [moment.legacyMomentId, moment]));
  return momentIds.filter((id) => {
    const moment = momentById.get(id);
    return moment ? canViewerSeeReelScene(moment, ctx) : false;
  });
}
