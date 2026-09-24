import type {
  LegacyRippleViewModel,
  RippleDirectNode,
  RippleDownstreamNode,
  RippleRecentItem,
} from '@/legacy/buildLegacyRippleViewModel';
import {
  canViewerSeeImpactItem,
  type LegacyViewerContext,
} from '@/legacy/legacyViewerAccess';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import type { SkywriteRecord } from '@/skywrite/types';

export function filterLegacyRippleViewModelForVisitor(input: {
  model: LegacyRippleViewModel;
  ctx: LegacyViewerContext;
  metrics: HumanPotentialMetricsState;
  skywrites: readonly SkywriteRecord[];
}): LegacyRippleViewModel {
  const { model, ctx, metrics, skywrites } = input;
  if (ctx.viewerUserId === ctx.subjectUserId) return model;

  const visibleImpactUserIds = new Set<string>();
  for (const event of metrics.impactEvents) {
    if (!canViewerSeeImpactItem(event, ctx, skywrites)) continue;
    if (event.contributorUserId === ctx.subjectUserId) {
      visibleImpactUserIds.add(event.impactedUserId);
    }
  }

  const filterNode = <T extends RippleDirectNode | RippleDownstreamNode>(node: T): T | null => {
    if (!visibleImpactUserIds.has(node.userId)) return null;
    return node;
  };

  const directNodes = model.directNodes
    .map((node) => filterNode(node))
    .filter((node): node is RippleDirectNode => node != null);

  const directIds = new Set(directNodes.map((node) => node.userId));
  const downstreamNodes = model.downstreamNodes
    .filter((node) => !directIds.has(node.userId))
    .map((node) => filterNode(node))
    .filter((node): node is RippleDownstreamNode => node != null);

  const recentImpact: RippleRecentItem[] = [];
  for (const event of metrics.impactEvents) {
    if (event.contributorUserId !== ctx.subjectUserId || !event.userConfirmed) continue;
    if (!canViewerSeeImpactItem(event, ctx, skywrites)) continue;
    const existing = model.recentImpact.find((item) => item.id === event.impactEventId);
    if (existing) recentImpact.push(existing);
  }
  for (const item of model.recentImpact) {
    if (recentImpact.some((entry) => entry.id === item.id)) continue;
    if (item.iconKind === 'star') {
      const ripple = metrics.rippleEvents.find((entry) => entry.rippleEventId === item.id);
      if (ripple && visibleImpactUserIds.has(ripple.downstreamUserId)) {
        recentImpact.push(item);
      }
    }
  }
  recentImpact.sort((a, b) => b.timestamp - a.timestamp);

  return {
    ...model,
    directNodes,
    downstreamNodes,
    recentImpact: recentImpact.slice(0, 12),
  };
}
