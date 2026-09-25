import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';
import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type { SavedThreadRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { isMutualSkyFriends } from '@/social/skyFollow/skyFollowLogic';
import type { FocusContext, TodayFocusSession } from '@/todayFocus/recommendations/focusRecommendationTypes';
import { focusTextFingerprint } from '@/todayFocus/recommendations/focusKeywordRelevance';

export function buildTodayFocusSession(input: {
  userId: string;
  record: TodayFocusRecord;
  relatedSkyAreaIds?: string[];
  relatedStarPathIds?: string[];
}): TodayFocusSession | null {
  if (!input.record.value || !input.record.source) return null;
  const activeDate = input.record.dateKey ?? getLocalDateKey();
  const createdAt = input.record.selectedAt
    ? Date.parse(input.record.selectedAt)
    : Date.now();
  const fingerprint = focusTextFingerprint(input.record.value);
  return {
    id: `focus-${input.userId}-${activeDate}-${fingerprint.slice(0, 24)}`,
    userId: input.userId,
    text: input.record.value,
    source: input.record.source,
    relatedSkyAreaIds: input.relatedSkyAreaIds ?? [],
    relatedStarPathIds: input.relatedStarPathIds ?? [],
    activeDate,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    status: 'active',
  };
}

export function buildFocusContext(input: {
  session: TodayFocusSession;
  profile: UserPersonalizationProfile;
  savedThreads: SavedThreadRecord[];
  evidence: HumanPotentialEvidenceRecord[];
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
  selectedSkyAreaIds: string[];
  relatedStarPathIds?: string[];
  signalProvenanceIds?: string[];
  opportunityIds?: string[];
}): FocusContext {
  const connectedSkyUserIds: string[] = [];
  for (const edge of input.followGraph.edges) {
    const otherId =
      edge.followerUserId === input.session.userId
        ? edge.followedUserId
        : edge.followerUserId;
    if (
      otherId &&
      isMutualSkyFriends(input.followGraph, input.session.userId, otherId) &&
      !input.blockedUserIds.includes(otherId)
    ) {
      connectedSkyUserIds.push(otherId);
    }
  }

  const learningIds = input.evidence
    .filter((entry) => entry.evidenceType === 'learning')
    .map((entry) => entry.evidenceId);
  const applicationIds = input.evidence
    .filter((entry) => entry.evidenceType === 'application')
    .map((entry) => entry.evidenceId);

  const northStar = input.profile.northStar.originalVision.trim();
  const reflectionIds = input.savedThreads.flatMap((thread) =>
    input.profile.todayFocus?.reflection ? [`focus-reflection-${input.session.activeDate}`] : [],
  );

  if (input.profile.todayFocus?.reflection?.trim()) {
    reflectionIds.push(`today-focus-reflection-${input.session.activeDate}`);
  }

  return {
    contextId: `ctx-${input.session.id}-${Date.now()}`,
    userId: input.session.userId,
    focusId: input.session.id,
    focusText: input.session.text,
    explicitSkyAreaIds: [...new Set([...input.selectedSkyAreaIds, ...input.session.relatedSkyAreaIds])],
    relatedStarPathIds: input.relatedStarPathIds ?? input.session.relatedStarPathIds,
    northStarContext: northStar || undefined,
    recentReflectionIds: [...new Set(reflectionIds)],
    savedThreadIds: input.savedThreads.map((thread) => thread.savedThreadId),
    learningIds,
    applicationIds,
    contributionContextIds: [],
    connectedSkyUserIds: [...new Set(connectedSkyUserIds)],
    joinedCommunityIds: input.profile.communities.joined.map((entry) => entry.id),
    opportunityContextIds: input.opportunityIds ?? [],
    signalProvenanceIds: input.signalProvenanceIds ?? [],
    createdAt: Date.now(),
  };
}
