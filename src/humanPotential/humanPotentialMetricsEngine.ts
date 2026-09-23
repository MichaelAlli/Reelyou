import type { ContributionRecord } from '@/contributions/contributionTypes';
import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import { evidenceIdFor } from '@/humanPotential/humanPotentialEvidenceTypes';
import type {
  ApplicationEvidenceRecord,
  ImpactEventRecord,
  LegacyProvenanceRef,
  RippleEventRecord,
  UniqueImpactRelationshipRecord,
} from '@/humanPotential/humanPotentialModels';
import {
  applicationEvidenceIdFor,
  impactEventIdFor,
  uniqueImpactRelationshipId,
} from '@/humanPotential/humanPotentialModels';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';

function touch(state: HumanPotentialMetricsState, now: number): HumanPotentialMetricsState {
  return { ...state, updatedAt: now };
}

/** Impacted user confirms; contributor is who helped them. */
export function resolveImpactParties(input: {
  viewerId: string;
  originalAuthorId: string;
  skywriteId: string;
  contributions: readonly ContributionRecord[];
  sourceResponseId?: string;
}): { contributorUserId: string; impactedUserId: string } | null {
  const impactedUserId = input.viewerId;
  const byResponse = input.sourceResponseId
    ? input.contributions.find(
        (entry) =>
          entry.sourceResponseId === input.sourceResponseId && entry.state === 'active',
      )
    : undefined;
  const bySkywrite = input.contributions.find(
    (entry) => entry.sourceSkywriteId === input.skywriteId && entry.state === 'active',
  );
  const contribution = byResponse ?? bySkywrite;
  if (contribution) {
    return { contributorUserId: contribution.responderId, impactedUserId };
  }
  if (input.viewerId !== input.originalAuthorId) {
    return { contributorUserId: input.originalAuthorId, impactedUserId };
  }
  return null;
}

export function deriveLivesImpacted(
  contributorUserId: string,
  state: HumanPotentialMetricsState,
): number {
  const unique = new Set<string>();
  for (const rel of state.uniqueImpactRelationships) {
    if (!rel.active) continue;
    if (rel.contributorUserId !== contributorUserId) continue;
    unique.add(rel.impactedUserId);
  }
  return unique.size;
}

export function deriveImpactEventCount(
  contributorUserId: string,
  impactedUserId: string,
  state: HumanPotentialMetricsState,
): number {
  return state.impactEvents.filter(
    (event) =>
      event.contributorUserId === contributorUserId &&
      event.impactedUserId === impactedUserId &&
      event.userConfirmed,
  ).length;
}

export function addLearningEvidence(input: {
  state: HumanPotentialMetricsState;
  userId: string;
  reflection: ThreadReflectionRecord;
  savedThreadId: string;
  sourceSkywriteId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  now?: number;
}): HumanPotentialMetricsState {
  const now = input.now ?? Date.now();
  const evidenceId = evidenceIdFor(input.reflection.reflectionId, 'learning');
  if (input.state.evidence.some((entry) => entry.evidenceId === evidenceId)) {
    return input.state;
  }
  const record: HumanPotentialEvidenceRecord = {
    evidenceId,
    userId: input.userId,
    evidenceType: 'learning',
    sourceType: 'reflection',
    sourceId: input.reflection.reflectionId,
    savedThreadId: input.savedThreadId,
    reflectionId: input.reflection.reflectionId,
    sourceSkywriteId: input.sourceSkywriteId,
    sourceResponseId: input.sourceResponseId ?? input.reflection.sourceResponseId,
    contributionId: input.contributionId ?? input.reflection.sourceContributionId,
    createdAt: now,
    userConfirmed: true,
    visibility: 'private',
  };
  return touch({ ...input.state, evidence: [...input.state.evidence, record] }, now);
}

export function addApplicationEvidence(input: {
  state: HumanPotentialMetricsState;
  userId: string;
  reflection: ThreadReflectionRecord;
  savedThreadId: string;
  sourceSkywriteId: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  now?: number;
}): HumanPotentialMetricsState {
  const now = input.now ?? Date.now();
  const applicationEvidenceId = applicationEvidenceIdFor(input.reflection.reflectionId);
  if (
    input.state.applicationEvidence.some(
      (entry) => entry.applicationEvidenceId === applicationEvidenceId,
    )
  ) {
    return input.state;
  }
  const record: ApplicationEvidenceRecord = {
    applicationEvidenceId,
    userId: input.userId,
    sourceSkywriteId: input.sourceSkywriteId,
    sourceThreadId: input.sourceThreadId,
    sourceResponseId: input.sourceResponseId ?? input.reflection.sourceResponseId,
    contributionId: input.contributionId ?? input.reflection.sourceContributionId,
    reflectionId: input.reflection.reflectionId,
    savedThreadId: input.savedThreadId,
    userConfirmed: true,
    context: input.reflection.body.trim(),
    createdAt: now,
    visibility: 'private',
  };
  const evidenceId = evidenceIdFor(input.reflection.reflectionId, 'application');
  let evidence = input.state.evidence;
  if (!evidence.some((entry) => entry.evidenceId === evidenceId)) {
    evidence = [
      ...evidence,
      {
        evidenceId,
        userId: input.userId,
        evidenceType: 'application',
        sourceType: 'reflection',
        sourceId: input.reflection.reflectionId,
        savedThreadId: input.savedThreadId,
        reflectionId: input.reflection.reflectionId,
        sourceSkywriteId: input.sourceSkywriteId,
        sourceResponseId: record.sourceResponseId,
        contributionId: record.contributionId,
        createdAt: now,
        userConfirmed: true,
        visibility: 'private',
      },
    ];
  }
  return touch(
    {
      ...input.state,
      evidence,
      applicationEvidence: [...input.state.applicationEvidence, record],
    },
    now,
  );
}

export function confirmImpactEvent(input: {
  state: HumanPotentialMetricsState;
  contributorUserId: string;
  impactedUserId: string;
  reflection: ThreadReflectionRecord;
  savedThreadId: string;
  sourceSkywriteId: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  applicationEvidenceId?: string;
  skyAreaId?: string;
  now?: number;
}): { state: HumanPotentialMetricsState; livesImpactedDelta: 0 | 1; impactEvent: ImpactEventRecord } {
  const now = input.now ?? Date.now();
  const impactEventId = impactEventIdFor(
    input.contributorUserId,
    input.impactedUserId,
    input.reflection.reflectionId,
  );
  const existing = input.state.impactEvents.find((entry) => entry.impactEventId === impactEventId);
  if (existing) {
    return { state: input.state, livesImpactedDelta: 0, impactEvent: existing };
  }

  const impactEvent: ImpactEventRecord = {
    impactEventId,
    contributorUserId: input.contributorUserId,
    impactedUserId: input.impactedUserId,
    sourceContributionId: input.contributionId ?? input.reflection.sourceContributionId,
    sourceApplicationEvidenceId: input.applicationEvidenceId,
    sourceReflectionId: input.reflection.reflectionId,
    sourceSkywriteId: input.sourceSkywriteId,
    sourceThreadId: input.sourceThreadId,
    sourceResponseId: input.sourceResponseId ?? input.reflection.sourceResponseId,
    skyAreaId: input.skyAreaId,
    userConfirmed: true,
    context: input.reflection.body.trim(),
    visibility: 'private',
    createdAt: now,
    updatedAt: now,
  };

  const relationshipId = uniqueImpactRelationshipId(
    input.contributorUserId,
    input.impactedUserId,
  );
  const existingRel = input.state.uniqueImpactRelationships.find(
    (entry) => entry.impactRelationshipId === relationshipId,
  );
  let livesImpactedDelta: 0 | 1 = 0;
  let uniqueImpactRelationships = input.state.uniqueImpactRelationships;

  if (existingRel) {
    uniqueImpactRelationships = uniqueImpactRelationships.map((entry) =>
      entry.impactRelationshipId === relationshipId
        ? {
            ...entry,
            latestImpactEventId: impactEventId,
            latestConfirmedAt: now,
            impactEventCount: entry.impactEventCount + 1,
            updatedAt: now,
          }
        : entry,
    );
  } else {
    livesImpactedDelta = 1;
    const rel: UniqueImpactRelationshipRecord = {
      impactRelationshipId: relationshipId,
      contributorUserId: input.contributorUserId,
      impactedUserId: input.impactedUserId,
      firstImpactEventId: impactEventId,
      firstConfirmedAt: now,
      latestImpactEventId: impactEventId,
      latestConfirmedAt: now,
      impactEventCount: 1,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    uniqueImpactRelationships = [...uniqueImpactRelationships, rel];
  }

  const evidenceId = evidenceIdFor(input.reflection.reflectionId, 'impact');
  let evidence = input.state.evidence;
  if (!evidence.some((entry) => entry.evidenceId === evidenceId)) {
    evidence = [
      ...evidence,
      {
        evidenceId,
        userId: input.impactedUserId,
        evidenceType: 'impact',
        sourceType: 'reflection',
        sourceId: input.reflection.reflectionId,
        savedThreadId: input.savedThreadId,
        reflectionId: input.reflection.reflectionId,
        sourceSkywriteId: input.sourceSkywriteId,
        sourceResponseId: impactEvent.sourceResponseId,
        contributionId: impactEvent.sourceContributionId,
        impactEventId,
        createdAt: now,
        userConfirmed: true,
        visibility: 'private',
      },
    ];
  }

  const state = touch(
    {
      ...input.state,
      evidence,
      impactEvents: [...input.state.impactEvents, impactEvent],
      uniqueImpactRelationships,
    },
    now,
  );

  return { state, livesImpactedDelta, impactEvent };
}

export function createRippleEvent(input: {
  state: HumanPotentialMetricsState;
  originatingContributorUserId: string;
  directImpactedUserId: string;
  downstreamUserId: string;
  parentImpactEventId: string;
  parentContributionId?: string;
  downstreamContributionId?: string;
  downstreamImpactEventId?: string;
  userConfirmed: boolean;
  now?: number;
}): HumanPotentialMetricsState {
  const now = input.now ?? Date.now();
  if (input.downstreamUserId === input.originatingContributorUserId) {
    return input.state;
  }
  const rippleEventId = `ripple-${input.parentImpactEventId}-${input.downstreamUserId}-${now}`;
  if (input.state.rippleEvents.some((entry) => entry.rippleEventId === rippleEventId)) {
    return input.state;
  }
  const parentDepth =
    input.state.rippleEvents.find((entry) => entry.downstreamUserId === input.directImpactedUserId)
      ?.rippleDepth ?? 0;
  const record: RippleEventRecord = {
    rippleEventId,
    originatingContributorUserId: input.originatingContributorUserId,
    directImpactedUserId: input.directImpactedUserId,
    downstreamUserId: input.downstreamUserId,
    parentImpactEventId: input.parentImpactEventId,
    parentContributionId: input.parentContributionId,
    downstreamContributionId: input.downstreamContributionId,
    downstreamImpactEventId: input.downstreamImpactEventId,
    rippleDepth: parentDepth + 1,
    userConfirmed: input.userConfirmed,
    createdAt: now,
    visibility: 'private',
  };
  return touch({ ...input.state, rippleEvents: [...input.state.rippleEvents, record] }, now);
}

/** Idempotent dedupe if legacy data created duplicate unique relationships. */
export function dedupeUniqueImpactRelationships(
  state: HumanPotentialMetricsState,
): HumanPotentialMetricsState {
  const byPair = new Map<string, UniqueImpactRelationshipRecord>();
  for (const rel of state.uniqueImpactRelationships) {
    const key = `${rel.contributorUserId}:${rel.impactedUserId}`;
    const existing = byPair.get(key);
    if (!existing) {
      byPair.set(key, rel);
      continue;
    }
    byPair.set(key, {
      ...existing,
      impactEventCount: existing.impactEventCount + rel.impactEventCount,
      latestConfirmedAt: Math.max(existing.latestConfirmedAt, rel.latestConfirmedAt),
      latestImpactEventId: rel.latestConfirmedAt > existing.latestConfirmedAt
        ? rel.latestImpactEventId
        : existing.latestImpactEventId,
      updatedAt: Math.max(existing.updatedAt, rel.updatedAt),
    });
  }
  return { ...state, uniqueImpactRelationships: [...byPair.values()] };
}

export function buildLegacyProvenanceRefs(
  state: HumanPotentialMetricsState,
  contributorUserId: string,
): LegacyProvenanceRef[] {
  const refs: LegacyProvenanceRef[] = [];
  for (const event of state.impactEvents) {
    if (event.contributorUserId !== contributorUserId) continue;
    refs.push({
      contributorUserId: event.contributorUserId,
      impactedUserId: event.impactedUserId,
      sourceSkywriteId: event.sourceSkywriteId,
      sourceThreadId: event.sourceThreadId,
      sourceResponseId: event.sourceResponseId,
      contributionId: event.sourceContributionId,
      impactEventId: event.impactEventId,
      reflectionId: event.sourceReflectionId,
      timestamp: event.createdAt,
      skyAreaId: event.skyAreaId,
      visibility: 'private',
    });
  }
  for (const ripple of state.rippleEvents) {
    if (ripple.originatingContributorUserId !== contributorUserId) continue;
    refs.push({
      contributorUserId: ripple.originatingContributorUserId,
      rippleEventId: ripple.rippleEventId,
      timestamp: ripple.createdAt,
      visibility: 'private',
    });
  }
  return refs.sort((a, b) => a.timestamp - b.timestamp);
}
