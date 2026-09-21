import type { StarPathAuthoritativeBundle } from '@/starpath/starpathPersistenceTypes';

/** Future Skywrite / reflection hooks — structured only, no invented data. */
export interface StarPathReflectionAdapterInput {
  savedNodeIds: string[];
  savedResourceIds: string[];
  activeMilestoneIds: string[];
  todayFocusText: string | null;
}

export function buildReflectionAdapterInput(
  bundle: Pick<StarPathAuthoritativeBundle, 'interactions' | 'resources' | 'dynamicWorld'>,
  todayFocusText: string | null,
): StarPathReflectionAdapterInput {
  const savedNodeIds = bundle.interactions.signals
    .filter((s) => !s.reversed && s.interactionType === 'saved')
    .map((s) => s.nodeId);
  return {
    savedNodeIds: [...new Set(savedNodeIds)],
    savedResourceIds: [...bundle.resources.savedResourceIds],
    activeMilestoneIds: bundle.dynamicWorld.milestones.map((m) => m.id),
    todayFocusText,
  };
}

/** Future live resource refresh — preserve user actions, update freshness only. */
export interface StarPathResourceRefreshPlan {
  preserveSavedIds: string[];
  preserveDismissedIds: string[];
  preserveOpenedTracking: boolean;
}

export function planResourceRefresh(
  resources: StarPathAuthoritativeBundle['resources'],
): StarPathResourceRefreshPlan {
  return {
    preserveSavedIds: [...resources.savedResourceIds],
    preserveDismissedIds: [...resources.dismissedResourceIds],
    preserveOpenedTracking: true,
  };
}
