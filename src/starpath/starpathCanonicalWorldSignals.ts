import { WorldSignalCopy } from '@/constants/worldSignalCopy';
import type {
  CanonicalSignalEvent,
  CanonicalSignalPresentation,
} from '@/signals/canonical/canonicalSignalModels';
import type { CanonicalSignalPreferenceContext } from '@/signals/canonical/canonicalSignalModels';
import type { CanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';
import type { SignalPrivacyContext } from '@/signals/canonical/canonicalSignalPrivacy';
import type { CanonicalSignalType } from '@/signals/canonical/canonicalSignalTypes';
import type { PlacedOpportunityNode } from '@/starpath/starpathOpportunityTypes';
import { computeAmbientSignals, type SignalEngineInput } from '@/starpath/starpathSignalEngine';
import type {
  StarPathAmbientSignal,
  StarPathSignalState,
  SignalReasonCode,
} from '@/starpath/starpathSignalTypes';

const OPPORTUNITY_CANONICAL_TYPES: ReadonlySet<CanonicalSignalType> = new Set([
  'door_opening',
  'starpath_opportunity',
  'contribution_opportunity',
]);

const GROWTH_CANONICAL_TYPES: ReadonlySet<CanonicalSignalType> = new Set([
  'growth_momentum',
  'repeated_theme',
  'direction_clarity',
  'reflection_return',
]);

/** Post-beta weather metaphors — never mapped to Beta world visuals. */
const DEFERRED_METAPHOR_TYPES: ReadonlySet<CanonicalSignalType> = new Set([
  'mist',
  'aurora',
  'reflection_rain',
  'clear_skies',
  'new_star_candidate',
]);

export interface StarPathWorldGrowthCue {
  signalEventId: string;
  nodeId: string;
  branchId: string;
  body: string;
}

export interface ComputeStarPathSignalsWithWorldInput extends SignalEngineInput {
  canonicalStore: CanonicalSignalStore;
  userId: string;
  signalPrefs: CanonicalSignalPreferenceContext;
  privacy: SignalPrivacyContext;
  /** When false, skip door/opportunity canonical boosts (discovery pref). */
  allowOpportunityWorldCue?: boolean;
  reduceMotion?: boolean;
}

function presentationEligibleForStarPathWorld(presentation: CanonicalSignalPresentation): boolean {
  return presentation.surfaceEligibility.includes('starpath_internal');
}

export function resolvePlacedNodeForCanonicalEvent(
  event: CanonicalSignalEvent,
  placedNodes: PlacedOpportunityNode[],
): PlacedOpportunityNode | null {
  const metaNode = event.metadata.opportunityNodeId ?? event.metadata.nodeId;
  if (typeof metaNode === 'string') {
    const byMeta = placedNodes.find((node) => node.nodeId === metaNode);
    if (byMeta) return byMeta;
  }
  for (const pathId of event.relatedStarPathIds) {
    const byPath = placedNodes.find((node) => node.nodeId === pathId);
    if (byPath) return byPath;
  }
  if (event.sourceType === 'starpath') {
    const bySource = placedNodes.find((node) => node.nodeId === event.sourceId);
    if (bySource) return bySource;
  }
  return placedNodes.find((node) => node.candidateId === event.sourceId) ?? null;
}

function upsertAmbientSignal(
  state: StarPathSignalState,
  signal: StarPathAmbientSignal,
): StarPathSignalState {
  const signalsById = { ...state.signalsById, [signal.id]: signal };
  const activeSignalIds = state.activeSignalIds.includes(signal.id)
    ? state.activeSignalIds
    : [...state.activeSignalIds, signal.id];
  return {
    ...state,
    signalsById,
    activeSignalIds,
    lastSignalUpdateAt: signal.lastShownAt,
  };
}

function boostOpportunitySignal(
  state: StarPathSignalState,
  node: PlacedOpportunityNode,
  now: number,
  reduceMotion: boolean,
): StarPathSignalState {
  const signalId = `sig-${node.nodeId}`;
  const existing = state.signalsById[signalId];
  const reasonCodes: SignalReasonCode[] = existing?.reasonCodes?.length
    ? [...existing.reasonCodes]
    : ['explicit_interest'];
  if (!reasonCodes.includes('focus_alignment')) {
    reasonCodes.push('focus_alignment');
  }

  const level =
    existing?.signalLevel === 'priority' || existing?.signalLevel === 'guide'
      ? existing.signalLevel
      : 'guide';

  const signal: StarPathAmbientSignal = {
    id: signalId,
    signalType: reduceMotion ? 'node_glow' : existing?.signalType ?? 'halo',
    signalLevel: level,
    sourceOpportunityId: node.candidateId,
    sourceNodeId: node.nodeId,
    sourceBranchId: node.branchId,
    reasonCodes,
    createdAt: existing?.createdAt ?? now,
    lastShownAt: now,
    guideEscalationEligible: true,
    offscreenDirection: existing?.offscreenDirection,
  };

  return upsertAmbientSignal(state, signal);
}

function growthSignalForNode(
  node: PlacedOpportunityNode,
  now: number,
  reduceMotion: boolean,
): StarPathAmbientSignal {
  const signalId = `cws-growth-${node.nodeId}`;
  return {
    id: signalId,
    signalType: reduceMotion ? 'node_glow' : 'branch_shimmer',
    signalLevel: 'notice',
    sourceNodeId: node.nodeId,
    sourceBranchId: node.branchId,
    reasonCodes: ['focus_alignment'],
    createdAt: now,
    lastShownAt: now,
    guideEscalationEligible: false,
  };
}

export function computeStarPathSignalsWithCanonicalWorld(
  input: ComputeStarPathSignalsWithWorldInput,
): { signalState: StarPathSignalState; growthCue: StarPathWorldGrowthCue | null } {
  const {
    canonicalStore,
    userId,
    signalPrefs,
    privacy,
    allowOpportunityWorldCue = true,
    reduceMotion = false,
  } = input;

  let state = computeAmbientSignals(input);
  const now = input.now;
  const presentations = canonicalStore
    .activePresentationsForUser(userId, signalPrefs, privacy, now)
    .filter(presentationEligibleForStarPathWorld);

  if (!presentations.length) {
    return { signalState: state, growthCue: null };
  }

  const eventById = new Map(
    canonicalStore.getState().events.map((event) => [event.id, event]),
  );

  if (allowOpportunityWorldCue) {
    for (const presentation of presentations) {
      const event = eventById.get(presentation.signalEventId);
      if (!event || DEFERRED_METAPHOR_TYPES.has(event.type)) continue;
      if (!OPPORTUNITY_CANONICAL_TYPES.has(event.type)) continue;
      const node = resolvePlacedNodeForCanonicalEvent(event, input.placedNodes);
      if (!node) continue;
      state = boostOpportunitySignal(state, node, now, reduceMotion);
    }
  }

  let growthCue: StarPathWorldGrowthCue | null = null;
  const growthPresentation = presentations.find((presentation) => {
    const event = eventById.get(presentation.signalEventId);
    return event && GROWTH_CANONICAL_TYPES.has(event.type);
  });

  if (growthPresentation) {
    const event = eventById.get(growthPresentation.signalEventId);
    if (event && !DEFERRED_METAPHOR_TYPES.has(event.type)) {
      const node =
        resolvePlacedNodeForCanonicalEvent(event, input.placedNodes) ??
        input.placedNodes.find((entry) => entry.prominence === 'primary') ??
        input.placedNodes[0];
      if (node) {
        const growthSignal = growthSignalForNode(node, now, reduceMotion);
        if (!state.activeSignalIds.includes(growthSignal.id)) {
          state = upsertAmbientSignal(state, growthSignal);
        }
        growthCue = {
          signalEventId: event.id,
          nodeId: node.nodeId,
          branchId: node.branchId,
          body: WorldSignalCopy.growthBody,
        };
      }
    }
  }

  return { signalState: state, growthCue };
}

export function findCanonicalEventForOpportunityNode(
  store: CanonicalSignalStore,
  userId: string,
  nodeId: string,
  candidateId?: string,
): CanonicalSignalEvent | undefined {
  return store.getState().events.find((event) => {
    if (event.userId !== userId) return false;
    if (!OPPORTUNITY_CANONICAL_TYPES.has(event.type)) return false;
    if (event.sourceId === nodeId || event.sourceId === candidateId) return true;
    if (event.relatedStarPathIds.includes(nodeId)) return true;
    const metaNode = event.metadata.opportunityNodeId ?? event.metadata.nodeId;
    return metaNode === nodeId;
  });
}
