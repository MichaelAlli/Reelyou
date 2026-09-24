import type { ContributionRecord } from '@/contributions/contributionTypes';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import { legacySafeSummaryForDeletedSource } from '@/skywrite/lifecycle/skywriteContentLifecycle';
import type { SkywriteContentLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import { pickSkywriteMediaSource } from '@/skywrite/media/skywriteMediaPreviewUtils';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import type {
  LegacyMediaRef,
  LegacyMoment,
  LegacyPersonRef,
  LegacyUserState,
} from '@/legacy/legacyMomentTypes';
import {
  legacyMomentIdForApplication,
  legacyMomentIdForContribution,
  legacyMomentIdForImpact,
  legacyMomentIdForLearning,
  legacyMomentIdForRipple,
} from '@/legacy/legacyMomentIds';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export interface BuildLegacyMomentsInput {
  ownerUserId: string;
  metrics: HumanPotentialMetricsState;
  contributions: readonly ContributionRecord[];
  reflections: readonly ThreadReflectionRecord[];
  lifecycle: SkywriteContentLifecycleView;
  skywrites: readonly SkywriteRecord[];
  blockedUserIds: readonly string[];
  userState: LegacyUserState;
  userDirectory: Readonly<Record<string, string>>;
  now?: number;
}

function personRef(
  userId: string,
  directory: Readonly<Record<string, string>>,
  blockedUserIds: readonly string[],
): LegacyPersonRef | null {
  if (blockedUserIds.includes(userId)) return null;
  const name = directory[userId];
  if (!name) return null;
  return { userId, displayName: name.split(' ')[0] ?? name };
}

function findSkywrite(
  skywrites: readonly SkywriteRecord[],
  skywriteId: string | undefined,
): SkywriteRecord | undefined {
  if (!skywriteId) return undefined;
  return skywrites.find((entry) => entry.id === skywriteId);
}

function findReflection(
  reflections: readonly ThreadReflectionRecord[],
  reflectionId: string | undefined,
): ThreadReflectionRecord | undefined {
  if (!reflectionId) return undefined;
  return reflections.find(
    (entry) => entry.reflectionId === reflectionId && entry.deletedAt == null,
  );
}

function mediaFromSkywrite(
  post: SkywriteRecord | undefined,
  deleted: boolean,
): LegacyMediaRef | undefined {
  if (deleted || !post) return undefined;
  const media = pickSkywriteMediaSource(post);
  if (media.kind === 'text') {
    const excerpt = post.text.trim().slice(0, 160);
    if (!excerpt) return undefined;
    return { kind: 'text', textExcerpt: excerpt };
  }
  if (media.kind === 'photo') {
    return { kind: 'photo', photoUri: media.photoUri ?? undefined };
  }
  if (media.kind === 'audio') {
    return {
      kind: 'audio',
      audioUri: media.audioUri ?? undefined,
      audioDurationMs: media.audioDurationMs ?? undefined,
    };
  }
  if (media.kind === 'photo_audio') {
    return {
      kind: 'photo_audio',
      photoUri: media.photoUri ?? undefined,
      audioUri: media.audioUri ?? undefined,
      audioDurationMs: media.audioDurationMs ?? undefined,
    };
  }
  return undefined;
}

function mediaFromReflection(reflection: ThreadReflectionRecord | undefined): LegacyMediaRef | undefined {
  if (!reflection?.audioUri) return undefined;
  return {
    kind: 'audio',
    audioUri: reflection.audioUri,
    audioDurationMs: reflection.audioDurationMs ?? undefined,
  };
}

function areaLabel(skyAreaId: string | undefined): string | null {
  if (!skyAreaId) return null;
  if (isSkyAreaCategoryId(skyAreaId)) return getSkyAreaCategory(skyAreaId).label;
  return skyAreaId.replace(/^custom-/, '').replace(/-/g, ' ');
}

function applyOverrides(moment: LegacyMoment, userState: LegacyUserState, now: number): LegacyMoment {
  const override = userState.momentOverrides[moment.legacyMomentId];
  if (!override) return moment;
  return {
    ...moment,
    title: override.title ?? moment.title,
    shortSummary: override.shortSummary ?? moment.shortSummary,
    sortOrder: override.sortOrder ?? moment.sortOrder,
    privacy: override.privacy ?? moment.privacy,
    userHidden: override.userHidden ?? moment.userHidden,
    userEdited: override.userEdited ?? moment.userEdited,
    updatedAt: override.updatedAt ?? moment.updatedAt ?? now,
  };
}

function learningEventType(reflection: ThreadReflectionRecord | undefined): LegacyMoment['eventType'] {
  if (reflection?.emotionalTags?.includes('hope')) return 'hope';
  if (reflection?.emotionalTags?.includes('less_alone')) return 'belonging';
  if (reflection?.emotionalTags?.includes('supported')) return 'belonging';
  const body = reflection?.body ?? '';
  if (/\b(less alone|not alone)\b/i.test(body)) return 'belonging';
  if (/\b(hope|move forward)\b/i.test(body)) return 'hope';
  return 'growth';
}

/** Synthesize Legacy moments from confirmed canonical evidence only. */
export function buildLegacyMoments(input: BuildLegacyMomentsInput): LegacyMoment[] {
  const now = input.now ?? Date.now();
  const moments: LegacyMoment[] = [];

  for (const record of input.metrics.evidence) {
    if (record.userId !== input.ownerUserId || !record.userConfirmed) continue;
    if (record.evidenceType !== 'learning') continue;
    const reflection = findReflection(input.reflections, record.reflectionId);
    const eventType = learningEventType(reflection);
    const deleted = record.sourceSkywriteId
      ? input.lifecycle.isContentDeleted(record.sourceSkywriteId)
      : false;
    const post = findSkywrite(input.skywrites, record.sourceSkywriteId);
    const title =
      eventType === 'hope'
        ? 'A step forward'
        : eventType === 'belonging'
          ? 'You weren’t alone in this'
          : 'Something stayed with you';
    const shortSummary = deleted
      ? 'A private growth moment from this season.'
      : reflection?.body.trim().slice(0, 200) ||
        'You confirmed something meaningful stayed with you.';
    moments.push({
      legacyMomentId: legacyMomentIdForLearning(record.evidenceId),
      ownerUserId: input.ownerUserId,
      sourceType: 'learning_evidence',
      sourceId: record.evidenceId,
      eventType,
      occurredAt: record.createdAt,
      title,
      shortSummary,
      mediaRefs: deleted
        ? mediaFromReflection(reflection)
        : mediaFromReflection(reflection) ?? mediaFromSkywrite(post, deleted),
      savedThreadId: record.savedThreadId,
      reflectionId: record.reflectionId,
      sourceSkywriteId: record.sourceSkywriteId,
      skyAreaId: post?.skyAreaId,
      privacy: 'private',
      userApproved: true,
      userEdited: false,
      userHidden: false,
      sortOrder: record.createdAt,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
      dimension: 'becoming',
      sourceContentDeleted: deleted,
    });
  }

  for (const app of input.metrics.applicationEvidence) {
    if (app.userId !== input.ownerUserId || !app.userConfirmed) continue;
    const deleted = input.lifecycle.isContentDeleted(app.sourceSkywriteId);
    const post = findSkywrite(input.skywrites, app.sourceSkywriteId);
    const reflection = findReflection(input.reflections, app.reflectionId);
    moments.push({
      legacyMomentId: legacyMomentIdForApplication(app.applicationEvidenceId),
      ownerUserId: input.ownerUserId,
      sourceType: 'application_evidence',
      sourceId: app.applicationEvidenceId,
      eventType: 'application',
      occurredAt: app.createdAt,
      title: 'You applied something real',
      shortSummary: deleted
        ? 'You confirmed you used something from a conversation.'
        : reflection?.body.trim().slice(0, 200) || 'You confirmed you applied something you learned.',
      mediaRefs: deleted ? undefined : mediaFromReflection(reflection) ?? mediaFromSkywrite(post, false),
      applicationEvidenceId: app.applicationEvidenceId,
      savedThreadId: app.savedThreadId,
      reflectionId: app.reflectionId,
      sourceSkywriteId: app.sourceSkywriteId,
      contributionId: app.contributionId,
      skyAreaId: post?.skyAreaId,
      privacy: 'private',
      userApproved: true,
      userEdited: false,
      userHidden: false,
      sortOrder: app.createdAt,
      createdAt: app.createdAt,
      updatedAt: app.createdAt,
      dimension: 'becoming',
      sourceContentDeleted: deleted,
    });
  }

  for (const impact of input.metrics.impactEvents) {
    if (!impact.userConfirmed) continue;
    const deleted = impact.sourceSkywriteId
      ? input.lifecycle.isContentDeleted(impact.sourceSkywriteId)
      : false;
    const post = findSkywrite(input.skywrites, impact.sourceSkywriteId);
    const reflection = findReflection(input.reflections, impact.sourceReflectionId);
    const tombstone = impact.sourceSkywriteId
      ? input.lifecycle.tombstoneFor(impact.sourceSkywriteId)
      : undefined;

    if (impact.contributorUserId === input.ownerUserId) {
      const person = personRef(
        impact.impactedUserId,
        input.userDirectory,
        input.blockedUserIds,
      );
      const name = person?.displayName ?? 'someone';
      moments.push({
        legacyMomentId: legacyMomentIdForImpact(impact.impactEventId),
        ownerUserId: input.ownerUserId,
        sourceType: 'impact_event',
        sourceId: impact.impactEventId,
        eventType: 'impact',
        occurredAt: impact.createdAt,
        title: `You helped ${name} move forward`,
        shortSummary: deleted
          ? tombstone
            ? legacySafeSummaryForDeletedSource(tombstone)
            : 'Something you shared meaningfully helped someone.'
          : impact.context?.trim() ||
            reflection?.body.trim().slice(0, 200) ||
            `A confirmed moment of meaningful impact with ${name}.`,
        mediaRefs: deleted ? undefined : mediaFromSkywrite(post, false),
        peopleRefs: person ? [person] : undefined,
        impactEventId: impact.impactEventId,
        contributionId: impact.sourceContributionId,
        savedThreadId: undefined,
        reflectionId: impact.sourceReflectionId,
        sourceSkywriteId: impact.sourceSkywriteId,
        skyAreaId: impact.skyAreaId ?? post?.skyAreaId,
        privacy: 'private',
        userApproved: true,
        userEdited: false,
        userHidden: false,
        sortOrder: impact.createdAt,
        createdAt: impact.createdAt,
        updatedAt: impact.updatedAt,
        dimension: 'impact',
        sourceContentDeleted: deleted,
      });
    }

    if (impact.impactedUserId === input.ownerUserId) {
      const person = personRef(
        impact.contributorUserId,
        input.userDirectory,
        input.blockedUserIds,
      );
      const name = person?.displayName ?? 'Someone';
      moments.push({
        legacyMomentId: `${legacyMomentIdForImpact(impact.impactEventId)}-received`,
        ownerUserId: input.ownerUserId,
        sourceType: 'impact_event',
        sourceId: impact.impactEventId,
        eventType: 'support_received',
        occurredAt: impact.createdAt,
        title: `${name} showed up for you`,
        shortSummary: deleted
          ? 'Support during this season made a meaningful difference.'
          : reflection?.body.trim().slice(0, 200) ||
            'You confirmed meaningful support during this season.',
        mediaRefs: deleted ? mediaFromReflection(reflection) : mediaFromReflection(reflection),
        peopleRefs: person ? [person] : undefined,
        impactEventId: impact.impactEventId,
        reflectionId: impact.sourceReflectionId,
        sourceSkywriteId: impact.sourceSkywriteId,
        skyAreaId: impact.skyAreaId,
        privacy: 'private',
        userApproved: true,
        userEdited: false,
        userHidden: false,
        sortOrder: impact.createdAt,
        createdAt: impact.createdAt,
        updatedAt: impact.updatedAt,
        dimension: 'becoming',
        sourceContentDeleted: deleted,
      });
    }
  }

  for (const ripple of input.metrics.rippleEvents) {
    if (!ripple.userConfirmed) continue;
    if (ripple.originatingContributorUserId !== input.ownerUserId) continue;
    const direct = personRef(ripple.directImpactedUserId, input.userDirectory, input.blockedUserIds);
    const downstream = personRef(ripple.downstreamUserId, input.userDirectory, input.blockedUserIds);
    const directName = direct?.displayName ?? 'someone you helped';
    moments.push({
      legacyMomentId: legacyMomentIdForRipple(ripple.rippleEventId),
      ownerUserId: input.ownerUserId,
      sourceType: 'ripple_event',
      sourceId: ripple.rippleEventId,
      eventType: 'ripple',
      occurredAt: ripple.createdAt,
      title: 'What you gave continued forward',
      shortSummary: downstream
        ? `What helped ${directName} later supported ${downstream.displayName}.`
        : `What helped ${directName} continued forward to someone else.`,
      peopleRefs: [direct, downstream].filter((entry): entry is LegacyPersonRef => entry != null),
      rippleEventId: ripple.rippleEventId,
      contributionId: ripple.parentContributionId,
      privacy: 'private',
      userApproved: true,
      userEdited: false,
      userHidden: false,
      sortOrder: ripple.createdAt,
      createdAt: ripple.createdAt,
      updatedAt: ripple.createdAt,
      dimension: 'impact',
      rippleVisual: 'downstream',
    });
  }

  for (const contribution of input.contributions) {
    if (contribution.responderId !== input.ownerUserId || contribution.state !== 'active') continue;
    if (moments.some((entry) => entry.contributionId === contribution.contributionId)) continue;
    const hasImpact = input.metrics.impactEvents.some(
      (entry) => entry.sourceContributionId === contribution.contributionId,
    );
    const hasApplication = input.metrics.applicationEvidence.some(
      (entry) => entry.contributionId === contribution.contributionId,
    );
    if (!hasImpact && !hasApplication) continue;
    const deleted = input.lifecycle.isContentDeleted(contribution.sourceSkywriteId);
    const post = findSkywrite(input.skywrites, contribution.sourceSkywriteId);
    const area = areaLabel(post?.skyAreaId ?? contribution.skyAreaId);
    moments.push({
      legacyMomentId: legacyMomentIdForContribution(contribution.contributionId),
      ownerUserId: input.ownerUserId,
      sourceType: 'contribution',
      sourceId: contribution.contributionId,
      eventType: 'contribution',
      occurredAt: contribution.createdAt,
      title: area ? `You contributed in ${area}` : 'You showed up with a contribution',
      shortSummary: deleted
        ? 'A contribution you made later became meaningful for someone.'
        : 'A saved response that later connected to real growth or impact.',
      mediaRefs: deleted ? undefined : mediaFromSkywrite(post, false),
      contributionId: contribution.contributionId,
      sourceSkywriteId: contribution.sourceSkywriteId,
      skyAreaId: post?.skyAreaId ?? contribution.skyAreaId,
      privacy: 'private',
      userApproved: true,
      userEdited: false,
      userHidden: false,
      sortOrder: contribution.createdAt,
      createdAt: contribution.createdAt,
      updatedAt: contribution.savedAt,
      dimension: 'both',
      sourceContentDeleted: deleted,
    });
  }

  return moments
    .map((moment) => applyOverrides(moment, input.userState, now))
    .sort((a, b) => a.occurredAt - b.occurredAt || a.sortOrder - b.sortOrder);
}
