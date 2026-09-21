import { STARPATH_STATE_VERSION } from '@/starpath/starpathPersistenceTypes';
import { EMPTY_GUIDANCE_STATE, type StarPathGuidanceState } from '@/starpath/starpathGuidanceTypes';
import {
  EMPTY_STARPATH_INTERACTIONS,
  type StarPathInteractionSnapshot,
} from '@/starpath/starpathInteractionTypes';
import { EMPTY_DYNAMIC_WORLD, type StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import { EMPTY_RESOURCE_STATE, type StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import { EMPTY_SIGNAL_STATE, type StarPathSignalState } from '@/starpath/starpathSignalTypes';

export function migrateInteractionSnapshot(
  input: Partial<StarPathInteractionSnapshot> | null,
): StarPathInteractionSnapshot {
  if (!input) return { ...EMPTY_STARPATH_INTERACTIONS };
  const signals = Array.isArray(input.signals) ? input.signals : [];
  return {
    version: 2,
    signals,
    softHighlightNodeIds: input.softHighlightNodeIds ?? [],
    activeBranchIds: input.activeBranchIds ?? [],
  };
}

export function migrateGuidanceState(input: Partial<StarPathGuidanceState> | null): StarPathGuidanceState {
  if (!input) return { ...EMPTY_GUIDANCE_STATE };
  return {
    ...EMPTY_GUIDANCE_STATE,
    ...input,
    guidanceVersion: input.guidanceVersion ?? STARPATH_STATE_VERSION,
    guideDismissedIds: input.guideDismissedIds ?? [],
    guideSnoozedUntil: input.guideSnoozedUntil ?? {},
    activeGuideSourceIds: input.activeGuideSourceIds ?? [],
    activeGuideReasonCodes: input.activeGuideReasonCodes ?? [],
    nextStepSourceIds: input.nextStepSourceIds ?? [],
  };
}

export function migrateDynamicWorld(input: Partial<StarPathDynamicWorldState> | null): StarPathDynamicWorldState {
  if (!input) return { ...EMPTY_DYNAMIC_WORLD };
  return {
    ...EMPTY_DYNAMIC_WORLD,
    ...input,
    version: input.version ?? EMPTY_DYNAMIC_WORLD.version,
    engineVersion: input.engineVersion ?? EMPTY_DYNAMIC_WORLD.engineVersion,
    nodes: Array.isArray(input.nodes) ? input.nodes : [],
    branchExtensions: Array.isArray(input.branchExtensions) ? input.branchExtensions : [],
    milestones: Array.isArray(input.milestones) ? input.milestones : [],
    worldExpansionPx: input.worldExpansionPx ?? 0,
  };
}

export function migrateResourceState(input: Partial<StarPathResourceState> | null): StarPathResourceState {
  if (!input) return { ...EMPTY_RESOURCE_STATE };
  return {
    ...EMPTY_RESOURCE_STATE,
    ...input,
    placedNodes: input.placedNodes ?? [],
    activeResourceIds: input.activeResourceIds ?? [],
    savedResourceIds: input.savedResourceIds ?? [],
    dismissedResourceIds: input.dismissedResourceIds ?? [],
    snoozedResourceUntil: input.snoozedResourceUntil ?? {},
    staleResourceIds: input.staleResourceIds ?? [],
    resourcesById: input.resourcesById ?? {},
  };
}

export function migrateSignalState(input: Partial<StarPathSignalState> | null): StarPathSignalState {
  if (!input) return { ...EMPTY_SIGNAL_STATE };
  return {
    ...EMPTY_SIGNAL_STATE,
    ...input,
    signalVersion: input.signalVersion ?? STARPATH_STATE_VERSION,
    signalsById: input.signalsById ?? {},
    activeSignalIds: input.activeSignalIds ?? [],
    acknowledgedSignalIds: input.acknowledgedSignalIds ?? [],
    dismissedSignalIds: input.dismissedSignalIds ?? [],
  };
}
