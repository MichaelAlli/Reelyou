import type { StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import type { ServerStarpathProgressSnapshot } from '@/starpath/serverStarpathProgressApi';
import type { UserSupportState } from '@/starpath/starpathEmotionalContextTypes';

export function mergeResourceStateWithCloud(
  local: StarPathResourceState,
  cloud: ServerStarpathProgressSnapshot['resources'] | undefined,
): StarPathResourceState {
  if (!cloud) return local;
  const snoozed = { ...local.snoozedResourceUntil };
  for (const [id, until] of Object.entries(cloud.snoozedResourceUntil ?? {})) {
    snoozed[id] = Math.max(snoozed[id] ?? 0, until);
  }
  return {
    ...local,
    savedResourceIds: [...new Set([...local.savedResourceIds, ...cloud.savedResourceIds])],
    dismissedResourceIds: [
      ...new Set([...local.dismissedResourceIds, ...cloud.dismissedResourceIds]),
    ],
    snoozedResourceUntil: snoozed,
  };
}

export function collectSettledMilestoneIds(world: StarPathDynamicWorldState): string[] {
  return world.milestones
    .filter((m) => m.status === 'visible' || m.status === 'archived')
    .map((m) => m.id);
}

export function mergeDynamicWorldMilestonesFromCloud(
  world: StarPathDynamicWorldState,
  cloudMilestoneIds: readonly string[],
): StarPathDynamicWorldState {
  if (cloudMilestoneIds.length === 0) return world;
  const known = new Set(world.milestones.map((m) => m.id));
  const missing = cloudMilestoneIds.filter((id) => !known.has(id));
  if (missing.length === 0) return world;
  return {
    ...world,
    milestones: [
      ...world.milestones,
      ...missing.map((id) => ({
        id,
        branchId: 'cloud-sync',
        refX: 0.5,
        refY: 0.85,
        sourceNodeIds: [],
        summaryType: 'branch_activity' as const,
        status: 'archived' as const,
        createdAt: Date.now(),
      })),
    ],
  };
}

export function resolveSupportStateFromCloud(
  local: UserSupportState,
  cloud: ServerStarpathProgressSnapshot['emotional'],
): UserSupportState {
  if (!cloud?.supportState || cloud.supportState === 'unknown') return local;
  return cloud.supportState as UserSupportState;
}
