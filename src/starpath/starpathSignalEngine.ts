import type { UserSupportState } from '@/starpath/starpathEmotionalContextTypes';
import type { PlacedOpportunityNode, OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import type { StarPathAmbientSignal, StarPathSignalState, SignalLevel } from '@/starpath/starpathSignalTypes';
import { OPPORTUNITY_ESCALATION, SIGNAL_GUARDRAILS } from '@/starpath/starpathResourceConfig';

export interface SignalEngineInput {
  now: number;
  placedNodes: PlacedOpportunityNode[];
  resourcesById: Record<string, OpportunityCandidate>;
  dismissedResourceIds: string[];
  viewportScrollY: number;
  viewportHeight: number;
  paddingTop: number;
  contentBandHeight: number;
  supportState: UserSupportState;
  previous: StarPathSignalState;
  acknowledgedSignalIds?: string[];
  dismissedSignalIds?: string[];
}

function timeSensitivityLevel(candidate: OpportunityCandidate, now: number): SignalLevel {
  const deadline = candidate.deadline ?? candidate.registrationDeadline;
  if (!deadline) return 'notice';
  const remaining = deadline - now;
  if (remaining <= OPPORTUNITY_ESCALATION.expiringDeadlineMs) return 'priority';
  if (remaining <= OPPORTUNITY_ESCALATION.soonDeadlineMs) return 'guide';
  if (remaining <= OPPORTUNITY_ESCALATION.approachingDeadlineMs) return 'notice';
  return 'whisper';
}

function capSignalsForEmotion(signals: StarPathAmbientSignal[], support: UserSupportState): StarPathAmbientSignal[] {
  const max =
    support === 'overloaded'
      ? SIGNAL_GUARDRAILS.overloadedMaxActiveSignals
      : SIGNAL_GUARDRAILS.maxActiveSignals;
  return signals.slice(0, max);
}

export function computeAmbientSignals(input: SignalEngineInput): StarPathSignalState {
  const {
    now,
    placedNodes,
    resourcesById,
    dismissedResourceIds,
    viewportScrollY,
    viewportHeight,
    paddingTop,
    contentBandHeight,
    supportState,
    previous,
    acknowledgedSignalIds = previous.acknowledgedSignalIds ?? [],
    dismissedSignalIds = previous.dismissedSignalIds ?? [],
  } = input;

  const raw: StarPathAmbientSignal[] = [];

  for (const node of placedNodes) {
    if (dismissedResourceIds.includes(node.candidateId)) continue;
    const signalId = `sig-${node.nodeId}`;
    if (dismissedSignalIds.includes(signalId)) continue;
    const resource = resourcesById[node.candidateId];
    if (!resource || resource.freshnessStatus === 'expired') continue;

    const worldY = paddingTop + node.refY * contentBandHeight;
    const offscreenBelow = worldY > viewportScrollY + viewportHeight + 32;
    const offscreenAbove = worldY < viewportScrollY - 32;

    let level: SignalLevel = node.prominence === 'primary' ? 'notice' : 'whisper';
    if (resource.deadline) level = timeSensitivityLevel(resource, now);

    if (acknowledgedSignalIds.includes(signalId)) {
      level = level === 'priority' ? 'notice' : 'whisper';
    }

    if (supportState === 'overloaded') {
      level = level === 'priority' ? 'guide' : 'whisper';
    } else if (supportState === 'energized' && level === 'whisper') {
      level = 'notice';
    }

    const undiscovered =
      !node.tracking.openedAt &&
      node.tracking.surfacedAt &&
      now - node.tracking.surfacedAt > OPPORTUNITY_ESCALATION.undiscoveredMentionAfterMs;

    raw.push({
      id: `sig-${node.nodeId}`,
      signalType: offscreenBelow || offscreenAbove ? 'directional_light' : 'node_glow',
      signalLevel: undiscovered && level !== 'priority' ? 'guide' : level,
      sourceOpportunityId: node.candidateId,
      sourceNodeId: node.nodeId,
      sourceBranchId: node.branchId,
      reasonCodes: undiscovered ? ['undiscovered_opportunity'] : resource.deadline ? ['time_sensitive'] : ['explicit_interest'],
      createdAt: now,
      lastShownAt: now,
      guideEscalationEligible: undiscovered || level === 'priority' || level === 'guide',
      offscreenDirection: offscreenBelow ? 'below' : offscreenAbove ? 'above' : undefined,
    });
  }

  const capped = capSignalsForEmotion(
    raw.sort((a, b) => {
      const order = { priority: 4, guide: 3, notice: 2, whisper: 1, silent: 0 };
      return order[b.signalLevel] - order[a.signalLevel];
    }),
    supportState,
  );

  const signalsById: Record<string, StarPathAmbientSignal> = {};
  for (const s of capped) signalsById[s.id] = s;

  return {
    signalVersion: previous.signalVersion,
    signalsById,
    activeSignalIds: capped.map((s) => s.id),
    acknowledgedSignalIds,
    dismissedSignalIds,
    lastSignalUpdateAt: now,
  };
}
