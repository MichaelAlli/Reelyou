import { isDevRuntime } from '@/constants/devFlags';
import { currentUser } from '@/data/mockData';
import {
  emitGrowthMomentumSignal,
  emitStarpathMetaphorSignal,
} from '@/signals/canonical/canonicalSignalEmitters';
import type { CanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';
import type { PlacedOpportunityNode } from '@/starpath/starpathOpportunityTypes';

let seededForSession = false;

/** Dev-only fixtures for StarPath world-signal visual QA. */
export function maybeSeedStarpathWorldSignalDemo(
  store: CanonicalSignalStore,
  placedNodes: PlacedOpportunityNode[],
  enabled: boolean,
): void {
  if (!enabled || !isDevRuntime() || seededForSession || !placedNodes.length) return;
  seededForSession = true;
  const userId = currentUser.id;
  const primary = placedNodes.find((node) => node.prominence === 'primary') ?? placedNodes[0];
  emitStarpathMetaphorSignal(store, userId, 'door_opening', primary.nodeId, {
    opportunityNodeId: primary.nodeId,
  });
  emitGrowthMomentumSignal(store, userId, primary.branchId, [`dev-seed-${primary.nodeId}`], {
    relatedStarPathNodeId: primary.nodeId,
  });
}
