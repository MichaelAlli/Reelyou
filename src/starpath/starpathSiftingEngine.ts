import {
  DENSITY_GUARDRAILS,
  INTERACTION_WEIGHTS,
  POSITIVE_EXPLICIT_TYPES,
  RECENCY_HALF_LIFE_MS,
  RELEVANCE_BAND_THRESHOLDS,
  SIGNAL_HISTORY_MAX,
  STABILITY_RULES,
  STARPATH_SIFTING_ENGINE_VERSION,
} from '@/starpath/starpathSiftingConfig';
import type {
  BranchAffinityEntry,
  EmergenceCandidate,
  NodeRelevanceResult,
  RelevanceBand,
  RelevanceReasonCode,
  StarPathGuideSummary,
  StarPathNextStepHints,
  StarPathSiftingState,
  ThemeAffinityEntry,
} from '@/starpath/starpathSiftingTypes';
import { deriveNodeUiState } from '@/starpath/starpathInteractionLogic';
import type { StarPathInteractionSignal, StarPathInteractionType } from '@/starpath/starpathInteractionTypes';
import { getAllStarPathNodeIds, getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import { normalizeInteractionSignals } from '@/starpath/starpathSignalSources';

export interface ComputeStarPathSiftingOptions {
  now?: number;
  previousState?: StarPathSiftingState | null;
  eligibleNodeIds?: string[];
  externalSignals?: StarPathInteractionSignal[];
}

function decayMultiplier(type: StarPathInteractionType, ageMs: number): number {
  const halfLife = RECENCY_HALF_LIFE_MS[type];
  if (halfLife == null || ageMs <= 0) return 1;
  return Math.pow(0.5, ageMs / halfLife);
}

function scoreToBand(score: number): RelevanceBand {
  if (score <= RELEVANCE_BAND_THRESHOLDS.suppressedMax) return 'suppressed';
  if (score <= RELEVANCE_BAND_THRESHOLDS.lowMax) return 'low';
  if (score <= RELEVANCE_BAND_THRESHOLDS.normalMax) return 'normal';
  if (score <= RELEVANCE_BAND_THRESHOLDS.elevatedMax) return 'elevated';
  return 'high';
}

function latestSignalForNode(
  nodeId: string,
  signals: StarPathInteractionSignal[],
): StarPathInteractionSignal | undefined {
  const forNode = signals.filter((s) => s.nodeId === nodeId && !s.reversed);
  if (!forNode.length) return undefined;
  return forNode.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b));
}

function applyHysteresisBand(
  nodeId: string,
  score: number,
  proposed: RelevanceBand,
  previous: NodeRelevanceResult | undefined,
  latest: StarPathInteractionSignal | undefined,
): RelevanceBand {
  if (!previous || previous.relevanceBand === proposed) return proposed;

  const explicitLatest =
    latest &&
    POSITIVE_EXPLICIT_TYPES.includes(latest.interactionType) &&
    latest.timestamp >= (previous.updatedAt ?? 0);

  if (STABILITY_RULES.explicitBypassesHysteresis && explicitLatest) return proposed;
  if (latest?.interactionType === 'dismissed' && !latest.reversed) return proposed;

  const delta = Math.abs(score - previous.relevanceScore);
  if (delta < STABILITY_RULES.minScoreDeltaForBandChange) {
    return previous.relevanceBand;
  }
  return proposed;
}

function passiveContribution(
  nodeSignals: StarPathInteractionSignal[],
  now: number,
  authDismissed: boolean,
): { passiveScore: number; reasons: RelevanceReasonCode[] } {
  if (authDismissed) return { passiveScore: 0, reasons: [] };

  let passiveScore = 0;
  const reasons: RelevanceReasonCode[] = [];
  for (const s of nodeSignals) {
    if (s.reversed) continue;
    if (s.interactionType === 'viewed') {
      const w = INTERACTION_WEIGHTS.viewed * decayMultiplier('viewed', now - s.timestamp);
      passiveScore += w;
      if (w > 0.02) reasons.push('passive_view');
    } else if (s.interactionType === 'explored') {
      const w = INTERACTION_WEIGHTS.explored * decayMultiplier('explored', now - s.timestamp);
      passiveScore += w * 0.35;
      if (w > 0.05) reasons.push('recent_exploration');
    }
  }

  passiveScore = Math.min(passiveScore, STABILITY_RULES.maxPassiveContributionPerNode);
  return { passiveScore, reasons: [...new Set(reasons)] };
}

function explicitReasonForType(type: StarPathInteractionType): RelevanceReasonCode | null {
  switch (type) {
    case 'interested':
      return 'explicit_interest';
    case 'selected':
      return 'explicit_selection';
    case 'saved':
      return 'saved_by_user';
    case 'dismissed':
      return 'dismissed_by_user';
    default:
      return null;
  }
}

function computeNodeRelevance(
  nodeId: string,
  signals: StarPathInteractionSignal[],
  branchAffinityScore: number,
  now: number,
  previous?: NodeRelevanceResult,
): NodeRelevanceResult {
  const nodeSignals = signals.filter((s) => s.nodeId === nodeId);
  const auth = deriveNodeUiState(nodeId, signals);
  const reasons: RelevanceReasonCode[] = [];
  let score = 0;

  if (auth === 'dismissed') {
    score = INTERACTION_WEIGHTS.dismissed;
    reasons.push('dismissed_by_user');
    const band = applyHysteresisBand(
      nodeId,
      score,
      'suppressed',
      previous,
      latestSignalForNode(nodeId, signals),
    );
    return {
      nodeId,
      relevanceScore: score,
      relevanceBand: band,
      reasons,
      updatedAt: now,
    };
  }

  if (auth === 'selected') {
    score += INTERACTION_WEIGHTS.selected;
    reasons.push('explicit_selection');
  } else if (auth === 'interested') {
    score += INTERACTION_WEIGHTS.interested;
    reasons.push('explicit_interest');
  } else if (auth === 'saved') {
    score += INTERACTION_WEIGHTS.saved;
    reasons.push('saved_by_user');
  } else if (auth === 'explored') {
    score += INTERACTION_WEIGHTS.explored * 0.85;
    reasons.push('recent_exploration');
  }

  const passive = passiveContribution(nodeSignals, now, false);
  score += passive.passiveScore;
  reasons.push(...passive.reasons);

  if (branchAffinityScore > 0.15) {
    const boost = Math.min(branchAffinityScore * 0.25, STABILITY_RULES.branchAffinityBoostCap);
    score += boost;
    reasons.push('branch_affinity');
  }

  const latest = latestSignalForNode(nodeId, signals);
  let band = scoreToBand(score);
  band = applyHysteresisBand(nodeId, score, band, previous, latest);

  return {
    nodeId,
    relevanceScore: roundScore(score),
    relevanceBand: band,
    reasons: uniqueReasons(reasons),
    updatedAt: now,
  };
}

function roundScore(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function uniqueReasons(codes: RelevanceReasonCode[]): RelevanceReasonCode[] {
  return [...new Set(codes)];
}

function computeBranchAndThemeAffinity(
  signals: StarPathInteractionSignal[],
  now: number,
): { branch: Record<string, BranchAffinityEntry>; theme: Record<string, ThemeAffinityEntry> } {
  const branch: Record<string, BranchAffinityEntry> = {};
  const theme: Record<string, ThemeAffinityEntry> = {};

  for (const s of signals) {
    if (s.reversed) continue;
    const weight = INTERACTION_WEIGHTS[s.interactionType] * decayMultiplier(s.interactionType, now - s.timestamp);
    if (s.interactionType === 'dismissed') continue;

    const branchId = s.branchId;
    const prev = branch[branchId] ?? {
      branchId,
      categoryId: branchId,
      relevance: 0,
      supportingSignals: [],
      lastUpdated: now,
    };
    prev.relevance += Math.max(0, weight);
    prev.supportingSignals.push(s.id);
    prev.lastUpdated = Math.max(prev.lastUpdated, s.timestamp);
    branch[branchId] = prev;

    const themePrev = theme[branchId] ?? {
      themeId: branchId,
      relevance: 0,
      engagementCount: 0,
      lastUpdated: now,
    };
    if (['explored', 'interested', 'saved', 'selected'].includes(s.interactionType)) {
      themePrev.engagementCount += 1;
    }
    themePrev.relevance += Math.max(0, weight * 0.9);
    themePrev.lastUpdated = Math.max(themePrev.lastUpdated, s.timestamp);
    theme[branchId] = themePrev;
  }

  for (const key of Object.keys(branch)) {
    branch[key].relevance = roundScore(branch[key].relevance);
  }
  for (const key of Object.keys(theme)) {
    theme[key].relevance = roundScore(theme[key].relevance);
  }

  return { branch, theme };
}

function buildEmergenceCandidates(
  nodeRelevance: Record<string, NodeRelevanceResult>,
  branchAffinity: Record<string, BranchAffinityEntry>,
  signals: StarPathInteractionSignal[],
  now: number,
): EmergenceCandidate[] {
  const exploredOrInterested = new Set(
    signals
      .filter(
        (s) =>
          !s.reversed &&
          (s.interactionType === 'explored' || s.interactionType === 'interested' || s.interactionType === 'selected'),
      )
      .map((s) => s.nodeId),
  );

  const raw: EmergenceCandidate[] = [];

  for (const nodeId of getAllStarPathNodeIds()) {
    const entry = getStarPathNodeCatalogEntry(nodeId);
    if (!entry) continue;
    const rel = nodeRelevance[nodeId];
    if (!rel || rel.relevanceBand === 'suppressed') continue;

    const branchScore = branchAffinity[entry.branchId]?.relevance ?? 0;
    const themeCount = branchAffinity[entry.branchId]?.supportingSignals.length ?? 0;
    const relatedHit = entry.relatedNodeIds.some((id) => exploredOrInterested.has(id));

    let eligibility = rel.relevanceScore * 0.55 + branchScore * 0.35;
    const reasonCodes: RelevanceReasonCode[] = [];

    if (rel.reasons.includes('explicit_interest') || rel.reasons.includes('explicit_selection')) {
      eligibility += 0.15;
      reasonCodes.push('explicit_interest');
    }
    if (themeCount >= STABILITY_RULES.themeEngagementThreshold) {
      eligibility += 0.12;
      reasonCodes.push('repeated_theme_engagement');
    }
    if (relatedHit) {
      eligibility += 0.1;
      reasonCodes.push('related_to_selected_branch');
    }
    if (branchScore > 0.2) reasonCodes.push('branch_affinity');

    if (eligibility < DENSITY_GUARDRAILS.emergenceMinEligibilityScore) continue;

    raw.push({
      candidateId: `emerge-${nodeId}`,
      nodeId,
      branchId: entry.branchId,
      categoryId: entry.branchId,
      eligibilityScore: roundScore(eligibility),
      reasonCodes: uniqueReasons(reasonCodes),
    });
  }

  const byNode = new Map<string, EmergenceCandidate>();
  for (const c of raw.sort((a, b) => b.eligibilityScore - a.eligibilityScore)) {
    if (!byNode.has(c.nodeId)) byNode.set(c.nodeId, c);
  }

  return [...byNode.values()]
    .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
    .slice(0, DENSITY_GUARDRAILS.maxEmergenceCandidates);
}

function applyDensityToElevated(nodeRelevance: Record<string, NodeRelevanceResult>): void {
  const elevated = Object.values(nodeRelevance)
    .filter((n) => n.relevanceBand === 'elevated' || n.relevanceBand === 'high')
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const allowed = new Set(
    elevated.slice(0, DENSITY_GUARDRAILS.maxElevatedNodes).map((n) => n.nodeId),
  );

  for (const n of elevated) {
    if (allowed.has(n.nodeId)) continue;
    n.relevanceBand = 'normal';
  }
}

function buildGuideSummary(
  nodeRelevance: Record<string, NodeRelevanceResult>,
  branchAffinity: Record<string, BranchAffinityEntry>,
  signals: StarPathInteractionSignal[],
  emergence: EmergenceCandidate[],
): StarPathGuideSummary {
  const elevatedBranchIds = Object.entries(branchAffinity)
    .filter(([, v]) => v.relevance >= 0.35)
    .sort((a, b) => b[1].relevance - a[1].relevance)
    .map(([id]) => id)
    .slice(0, 4);

  const recentExplicitInterests = signals
    .filter((s) => !s.reversed && (s.interactionType === 'interested' || s.interactionType === 'selected'))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map((s) => s.nodeId);

  const dismissedNodeIds = Object.values(nodeRelevance)
    .filter((n) => n.relevanceBand === 'suppressed')
    .map((n) => n.nodeId);

  return {
    elevatedBranchIds,
    recentExplicitInterests: [...new Set(recentExplicitInterests)],
    dismissedNodeIds,
    emergenceCandidateIds: emergence.map((e) => e.nodeId),
  };
}

function buildNextStepHints(
  nodeRelevance: Record<string, NodeRelevanceResult>,
  guide: StarPathGuideSummary,
  signals: StarPathInteractionSignal[],
): StarPathNextStepHints {
  const byInterest = Object.values(nodeRelevance)
    .filter((n) => n.reasons.includes('explicit_interest') || n.reasons.includes('explicit_selection'))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)[0];

  const saved = signals
    .filter((s) => !s.reversed && s.interactionType === 'saved')
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const exploredNeutral = signals
    .filter((s) => !s.reversed && s.interactionType === 'explored')
    .sort((a, b) => b.timestamp - a.timestamp)
    .find((s) => {
      const ui = deriveNodeUiState(s.nodeId, signals);
      return ui === 'explored' || ui === 'viewed';
    });

  return {
    highestExplicitInterestNodeId: byInterest?.nodeId ?? guide.recentExplicitInterests[0] ?? null,
    elevatedBranchId: guide.elevatedBranchIds[0] ?? null,
    recentSavedNodeId: saved?.nodeId ?? null,
    unresolvedExplorationNodeId: exploredNeutral?.nodeId ?? null,
  };
}

export function computeStarPathSiftingState(
  primarySignals: StarPathInteractionSignal[],
  options: ComputeStarPathSiftingOptions = {},
): StarPathSiftingState {
  const now = options.now ?? Date.now();
  const trimmed =
    primarySignals.length > SIGNAL_HISTORY_MAX
      ? primarySignals.slice(-SIGNAL_HISTORY_MAX)
      : primarySignals;
  const signals = normalizeInteractionSignals(trimmed, options.externalSignals ?? []);
  const eligible = options.eligibleNodeIds ?? getAllStarPathNodeIds();
  const previous = options.previousState;

  const { branch: branchAffinity, theme: themeAffinity } = computeBranchAndThemeAffinity(signals, now);

  const nodeRelevance: Record<string, NodeRelevanceResult> = {};
  for (const nodeId of eligible) {
    const entry = getStarPathNodeCatalogEntry(nodeId);
    const branchScore = entry ? branchAffinity[entry.branchId]?.relevance ?? 0 : 0;
    nodeRelevance[nodeId] = computeNodeRelevance(
      nodeId,
      signals,
      branchScore,
      now,
      previous?.nodeRelevance[nodeId],
    );
  }

  applyDensityToElevated(nodeRelevance);

  const emergenceCandidates = buildEmergenceCandidates(nodeRelevance, branchAffinity, signals, now);
  const guideSummary = buildGuideSummary(nodeRelevance, branchAffinity, signals, emergenceCandidates);
  const nextStepHints = buildNextStepHints(nodeRelevance, guideSummary, signals);

  return {
    engineVersion: STARPATH_SIFTING_ENGINE_VERSION,
    nodeRelevance,
    branchAffinity,
    themeAffinity,
    emergenceCandidates,
    lastCalculatedAt: now,
    guideSummary,
    nextStepHints,
  };
}

/** Subtle visual modifier delta from internal band (no scores in UI). */
export function relevanceBandVisualDelta(band: RelevanceBand | undefined): {
  opacityMultiplier: number;
  extraGlow: number;
  softPulse: boolean;
} {
  switch (band) {
    case 'high':
      return { opacityMultiplier: 1, extraGlow: 0.06, softPulse: true };
    case 'elevated':
      return { opacityMultiplier: 1, extraGlow: 0.04, softPulse: false };
    case 'low':
      return { opacityMultiplier: 0.97, extraGlow: 0, softPulse: false };
    case 'suppressed':
      return { opacityMultiplier: 0.38, extraGlow: 0, softPulse: false };
    default:
      return { opacityMultiplier: 1, extraGlow: 0, softPulse: false };
  }
}
