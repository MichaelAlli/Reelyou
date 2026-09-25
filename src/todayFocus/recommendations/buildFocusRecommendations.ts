import { orbitUsers } from '@/data/mockData';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type { SavedThreadRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import type { ContributionRecord } from '@/contributions/contributionTypes';
import {
  FOCUS_EXTERNAL_RESOURCE_CATALOG,
} from '@/todayFocus/recommendations/focusExternalResourceCatalog';
import {
  FIXTURE_SAVED_THREAD_CORPUS,
  interviewFocusFixtureSavedThread,
} from '@/todayFocus/recommendations/focusRecommendationFixtures';
import type {
  FocusContext,
  FocusRecommendation,
  TodayFocusSession,
} from '@/todayFocus/recommendations/focusRecommendationTypes';
import {
  FOCUS_RECOMMENDATION_MAX,
  FOCUS_RECOMMENDATION_MIN_SCORE,
} from '@/todayFocus/recommendations/focusRecommendationTypes';
import { focusTextRelevanceScore } from '@/todayFocus/recommendations/focusKeywordRelevance';
import {
  canRecommendConnectedSky,
  canRecommendSkywrite,
  type FocusEligibilityContext,
  privacyScopeForOwnerContent,
} from '@/todayFocus/recommendations/focusResourceEligibility';

const TYPE_PRIORITY: Record<FocusRecommendation['type'], number> = {
  saved_thread: 1.0,
  reflection: 0.95,
  starpath_step: 0.9,
  learning: 0.85,
  application: 0.84,
  skywrite: 0.8,
  contribution: 0.78,
  connected_sky: 0.75,
  community: 0.72,
  opportunity: 0.7,
  internal_resource: 0.65,
  legacy_moment: 0.6,
  emerging_constellation: 0.58,
  guide_prompt: 0.4,
  external_resource: 0.55,
};

interface CandidateDraft extends Omit<FocusRecommendation, 'id' | 'createdAt'> {
  rankScore: number;
}

function areaBoost(context: FocusContext, areaId?: string | null): number {
  if (!areaId) return 0;
  return context.explicitSkyAreaIds.includes(areaId) ? 0.12 : 0;
}

function buildCandidateId(focusId: string, type: string, sourceId: string): string {
  return `fr-${focusId}-${type}-${sourceId}`;
}

export interface BuildFocusRecommendationsInput {
  session: TodayFocusSession;
  context: FocusContext;
  eligibility: FocusEligibilityContext;
  savedThreads: SavedThreadRecord[];
  skywrites: SkywriteRecord[];
  evidence: HumanPotentialEvidenceRecord[];
  contributions: ContributionRecord[];
  dismissedRecommendationKeys: readonly string[];
  previouslyOpenedKeys: readonly string[];
  northStarText?: string;
  focusReflectionText?: string | null;
  starPathNodeIds?: string[];
  emergingConstellationAvailable?: boolean;
}

export function buildFocusRecommendations(input: BuildFocusRecommendationsInput): FocusRecommendation[] {
  const { session, context } = input;
  const focusText = session.text;
  const drafts: CandidateDraft[] = [];
  const now = Date.now();

  const threads = [...input.savedThreads];
  const fixtureThread = interviewFocusFixtureSavedThread(session.userId);
  if (fixtureThread && !threads.some((t) => t.savedThreadId === fixtureThread.savedThreadId)) {
    threads.push(fixtureThread);
  }

  for (const thread of threads) {
    if (thread.status !== 'active') continue;
    if (input.eligibility.blockedUserIds.includes(thread.originalAuthorId)) continue;
    const corpus =
      FIXTURE_SAVED_THREAD_CORPUS[thread.savedThreadId] ??
      input.skywrites.find((sw) => sw.id === thread.skywriteId)?.text ??
      '';
    const relevance = focusTextRelevanceScore(focusText, corpus);
    const score = relevance * TYPE_PRIORITY.saved_thread + areaBoost(context, thread.skyAreaId);
    if (relevance < 0.2 && score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'saved_thread',
      title: 'Saved thread',
      summary: corpus.slice(0, 96) || 'A thread you saved earlier.',
      whyRelevant: 'You saved this earlier. It may be useful now.',
      sourceType: 'saved_thread',
      sourceId: thread.savedThreadId,
      destination: `/skywrite/saved/${thread.savedThreadId}`,
      relatedSkyAreaIds: thread.skyAreaId ? [thread.skyAreaId] : [],
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: score >= 0.75 ? 'high' : score >= 0.55 ? 'medium' : 'low',
      provenanceIds: [thread.savedThreadId],
      visualHint: 'saved',
      rankScore: score,
    });
  }

  if (input.focusReflectionText?.trim()) {
    const relevance = focusTextRelevanceScore(focusText, input.focusReflectionText);
    const score = relevance * TYPE_PRIORITY.reflection + 0.08;
    if (score >= FOCUS_RECOMMENDATION_MIN_SCORE) {
      drafts.push({
        userId: session.userId,
        focusId: session.id,
        type: 'reflection',
        title: 'Your earlier reflection',
        summary: input.focusReflectionText.slice(0, 120),
        whyRelevant: 'You wrote about something related — it may help you see a pattern.',
        sourceType: 'reflection',
        sourceId: `today-focus-reflection-${session.activeDate}`,
        destination: '/today-focus-reflection',
        relatedSkyAreaIds: context.explicitSkyAreaIds,
        relatedStarPathIds: [],
        privacyScope: privacyScopeForOwnerContent(),
        confidenceBand: 'medium',
        provenanceIds: [`today-focus-reflection-${session.activeDate}`],
        visualHint: 'reflection',
        rankScore: score,
      });
    }
  }

  const starPathIds = input.starPathNodeIds?.length
    ? input.starPathNodeIds
    : ['sym-book', 'p-blue-1'];
  for (const nodeId of starPathIds) {
    const node = getStarPathNodeCatalogEntry(nodeId);
    if (!node) continue;
    const corpus = `${node.title} ${node.subtitle} ${node.whyItMatters} ${node.branchId}`;
    const relevance = focusTextRelevanceScore(focusText, corpus);
    const score = relevance * TYPE_PRIORITY.starpath_step + areaBoost(context, node.branchId);
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'starpath_step',
      title: node.title,
      summary: node.subtitle,
      whyRelevant: 'Your current StarPath includes a step related to this.',
      sourceType: 'starpath',
      sourceId: node.id,
      destination: '/(tabs)/starpath',
      relatedSkyAreaIds: isSkyAreaCategoryId(node.branchId) ? [node.branchId] : [],
      relatedStarPathIds: [node.id],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: score >= 0.7 ? 'high' : 'medium',
      provenanceIds: [node.id],
      visualHint: 'starpath',
      rankScore: score,
    });
  }

  if (input.northStarText?.trim()) {
    const relevance = focusTextRelevanceScore(focusText, input.northStarText);
    const score = relevance * 0.5;
    if (relevance >= 0.25) {
      drafts.push({
        userId: session.userId,
        focusId: session.id,
        type: 'internal_resource',
        title: 'North Star alignment',
        summary: 'Your stated direction may inform how you approach today.',
        whyRelevant: 'This focus connects to the direction you chose for your North Star.',
        sourceType: 'north_star',
        destination: '/my-sky',
        relatedSkyAreaIds: [],
        relatedStarPathIds: [],
        privacyScope: privacyScopeForOwnerContent(),
        confidenceBand: 'medium',
        provenanceIds: ['north-star'],
        visualHint: 'starpath',
        rankScore: score,
      });
    }
  }

  for (const areaId of context.explicitSkyAreaIds) {
    if (!isSkyAreaCategoryId(areaId)) continue;
    const label = getSkyAreaCategory(areaId).label;
    const relevance = focusTextRelevanceScore(focusText, label);
    const score = relevance * 0.65 + 0.1;
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'internal_resource',
      title: label,
      summary: `Growth context from your ${label} area.`,
      whyRelevant: `This connects to the ${label} area you’ve been working through.`,
      sourceType: 'sky_area',
      sourceId: areaId,
      destination: `/growth-area/${areaId}`,
      relatedSkyAreaIds: [areaId],
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: 'medium',
      provenanceIds: [areaId],
      visualHint: 'learning',
      rankScore: score,
    });
  }

  for (const entry of input.evidence) {
    if (entry.evidenceType === 'learning') {
      drafts.push({
        userId: session.userId,
        focusId: session.id,
        type: 'learning',
        title: 'Learning you captured',
        summary: entry.note ?? 'Something you marked as learning.',
        whyRelevant: 'You learned something here that may help today.',
        sourceType: 'learning_evidence',
        sourceId: entry.evidenceId,
        destination: '/(tabs)/legacy',
        relatedSkyAreaIds: [],
        relatedStarPathIds: [],
        privacyScope: privacyScopeForOwnerContent(),
        confidenceBand: 'medium',
        provenanceIds: [entry.evidenceId],
        visualHint: 'learning',
        rankScore: TYPE_PRIORITY.learning * 0.55,
      });
    }
    if (entry.evidenceType === 'application') {
      drafts.push({
        userId: session.userId,
        focusId: session.id,
        type: 'application',
        title: 'Something you applied before',
        summary: entry.note ?? 'A prior application you recorded.',
        whyRelevant: 'You tried something similar before.',
        sourceType: 'application_evidence',
        sourceId: entry.evidenceId,
        destination: '/(tabs)/legacy',
        relatedSkyAreaIds: [],
        relatedStarPathIds: [],
        privacyScope: privacyScopeForOwnerContent(),
        confidenceBand: 'medium',
        provenanceIds: [entry.evidenceId],
        visualHint: 'learning',
        rankScore: TYPE_PRIORITY.application * 0.55,
      });
    }
  }

  for (const contribution of input.contributions) {
    if (contribution.state !== 'active') continue;
    if (input.eligibility.blockedUserIds.includes(contribution.responderId)) continue;
    const source = input.skywrites.find((sw) => sw.id === contribution.sourceSkywriteId);
    if (!source || !canRecommendSkywrite(source, input.eligibility)) continue;
    const relevance = focusTextRelevanceScore(focusText, source.text ?? '');
    const score = relevance * TYPE_PRIORITY.contribution;
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'contribution',
      title: 'Support that may relate',
      summary: source.text?.slice(0, 100) ?? 'A contribution from your journey.',
      whyRelevant: 'A contribution you received connects to this focus.',
      sourceType: 'contribution',
      sourceId: contribution.contributionId,
      destination: `/skywrite/${source.id}`,
      relatedSkyAreaIds: source.skyAreaId ? [source.skyAreaId] : [],
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: 'medium',
      provenanceIds: [contribution.contributionId, source.id],
      visualHint: 'contribution',
      rankScore: score,
    });
  }

  for (const userId of context.connectedSkyUserIds) {
    if (!canRecommendConnectedSky(userId, input.eligibility)) continue;
    const person = orbitUsers.find((entry) => entry.id === userId);
    const corpus = `${person?.name ?? ''} ${person?.themes.join(' ')} ${person?.label ?? ''}`;
    const relevance = focusTextRelevanceScore(focusText, corpus);
    const score = relevance * TYPE_PRIORITY.connected_sky;
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'connected_sky',
      title: person?.name?.split(' ')[0] ?? 'Connected Sky',
      summary: 'Shared experience on a Connected Sky.',
      whyRelevant: `${person?.name?.split(' ')[0] ?? 'Someone in your Connected Skies'} has shared experience related to this.`,
      sourceType: 'connected_sky',
      sourceId: userId,
      destination: `/visitor-profile?id=${encodeURIComponent(userId)}`,
      relatedSkyAreaIds: [],
      relatedStarPathIds: [],
      privacyScope: 'connected_skies',
      confidenceBand: 'medium',
      provenanceIds: [userId],
      visualHint: 'person',
      rankScore: score,
    });
  }

  for (const communityId of context.joinedCommunityIds) {
    const relevance = focusTextRelevanceScore(focusText, communityId.replace(/-/g, ' '));
    const score = relevance * TYPE_PRIORITY.community + 0.05;
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'community',
      title: 'Community context',
      summary: 'A constellation you belong to may have related conversation.',
      whyRelevant: 'Your community may have discussion related to this focus.',
      sourceType: 'community',
      sourceId: communityId,
      destination: `/community/${communityId}`,
      relatedSkyAreaIds: [],
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: 'low',
      provenanceIds: [communityId],
      visualHint: 'community',
      rankScore: score,
    });
  }

  if (input.emergingConstellationAvailable) {
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'emerging_constellation',
      title: 'Emerging constellation',
      summary: 'A like-hearted group may be forming around similar themes.',
      whyRelevant: 'A like-hearted constellation may be relevant to this.',
      sourceType: 'emerging_constellation',
      destination: '/emerging-constellation/preview',
      relatedSkyAreaIds: context.explicitSkyAreaIds,
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: 'medium',
      provenanceIds: context.signalProvenanceIds,
      visualHint: 'community',
      rankScore: TYPE_PRIORITY.emerging_constellation,
    });
  }

  let bestExternalScore = 0;
  for (const resource of FOCUS_EXTERNAL_RESOURCE_CATALOG) {
    const relevance = focusTextRelevanceScore(
      focusText,
      `${resource.title} ${resource.summary} ${resource.topicKeywords.join(' ')}`,
    );
    const score =
      relevance * TYPE_PRIORITY.external_resource +
      areaBoost(context, resource.relatedSkyAreaIds[0]);
    if (score < FOCUS_RECOMMENDATION_MIN_SCORE) continue;
    bestExternalScore = Math.max(bestExternalScore, score);
    drafts.push({
      userId: session.userId,
      focusId: session.id,
      type: 'external_resource',
      title: resource.title,
      summary: resource.summary,
      whyRelevant: `This external resource from ${resource.provider} may support today’s focus.`,
      sourceType: 'external_resource',
      sourceId: resource.resourceId,
      destination: resource.destinationUrl,
      relatedSkyAreaIds: resource.relatedSkyAreaIds,
      relatedStarPathIds: [],
      privacyScope: privacyScopeForOwnerContent(),
      confidenceBand: relevance >= 0.5 ? 'medium' : 'low',
      provenanceIds: [resource.resourceId],
      visualHint: 'resource',
      rankScore: score,
      expiresAt: now + 1000 * 60 * 60 * 24 * 14,
    });
  }

  const filtered = drafts
    .filter((draft) => {
      const key = `${draft.type}:${draft.sourceId ?? draft.title}`;
      if (input.dismissedRecommendationKeys.includes(key)) return false;
      if (input.previouslyOpenedKeys.includes(key)) {
        draft.rankScore *= 0.85;
      }
      return draft.rankScore >= FOCUS_RECOMMENDATION_MIN_SCORE;
    })
    .sort((a, b) => b.rankScore - a.rankScore);

  const internal = filtered.filter((entry) => entry.type !== 'external_resource');
  const external = filtered.filter((entry) => entry.type === 'external_resource');
  const picked: CandidateDraft[] = [];
  const usedTypes = new Set<string>();

  for (const entry of internal) {
    if (picked.length >= FOCUS_RECOMMENDATION_MAX) break;
    picked.push(entry);
    usedTypes.add(entry.type);
  }

  if (picked.length < FOCUS_RECOMMENDATION_MAX && external.length > 0) {
    const topInternal = picked[0]?.rankScore ?? 0;
    const topExternal = external[0];
    if (topExternal && (topInternal === 0 || topExternal.rankScore >= bestExternalScore * 0.85)) {
      if (picked.length >= 3 || topExternal.rankScore >= FOCUS_RECOMMENDATION_MIN_SCORE + 0.08) {
        picked.push(topExternal);
      }
    }
  }

  while (picked.length < Math.min(3, FOCUS_RECOMMENDATION_MAX) && picked.length < filtered.length) {
    const next = filtered.find(
      (entry) => !picked.some((p) => p.sourceId === entry.sourceId && p.type === entry.type),
    );
    if (!next) break;
    picked.push(next);
  }

  return picked.slice(0, FOCUS_RECOMMENDATION_MAX).map((draft) => ({
    ...draft,
    id: buildCandidateId(session.id, draft.type, draft.sourceId ?? draft.title),
    createdAt: now,
    rankScore: undefined,
  }));
}
