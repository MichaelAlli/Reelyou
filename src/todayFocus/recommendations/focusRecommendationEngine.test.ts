import { EMPTY_PERSONALIZATION_PROFILE } from '@/onboarding/personalization/types';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import { buildFocusContext, buildTodayFocusSession } from '@/todayFocus/recommendations/buildFocusContext';
import { buildFocusRecommendations } from '@/todayFocus/recommendations/buildFocusRecommendations';
import { buildTodayFocusGuideResponse } from '@/todayFocus/recommendations/buildTodayFocusGuideResponse';
import { interviewFocusFixtureSavedThread } from '@/todayFocus/recommendations/focusRecommendationFixtures';
import {
  fingerprintForFocusText,
  findStableSession,
  markRecommendationDismissed,
  upsertRecommendationSession,
} from '@/todayFocus/recommendations/focusRecommendationStore';
import { FOCUS_RECOMMENDATION_MAX } from '@/todayFocus/recommendations/focusRecommendationTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testInterviewFocusInternalFirst() {
  const record = {
    value: 'Prepare for my sales interview.',
    source: 'custom' as const,
    dateKey: '2026-09-24',
    selectedAt: new Date().toISOString(),
    reflection: null,
    reflectionUpdatedAt: null,
  };
  const session = buildTodayFocusSession({
    userId: 'user-michael',
    record,
    relatedSkyAreaIds: ['career'],
  });
  assert(Boolean(session), 'session');
  if (!session) return;

  const context = buildFocusContext({
    session,
    profile: {
      ...EMPTY_PERSONALIZATION_PROFILE,
      northStar: { originalVision: 'Lead with courage in my career.' },
    },
    savedThreads: [interviewFocusFixtureSavedThread('user-michael')!],
    evidence: [],
    followGraph: EMPTY_SKY_FOLLOW_GRAPH,
    blockedUserIds: [],
    selectedSkyAreaIds: ['career'],
  });

  const recommendations = buildFocusRecommendations({
    session,
    context,
    eligibility: {
      viewerUserId: 'user-michael',
      blockedUserIds: [],
      followGraph: EMPTY_SKY_FOLLOW_GRAPH,
      deletedSkywriteIds: [],
    },
    savedThreads: [interviewFocusFixtureSavedThread('user-michael')!],
    skywrites: [],
    evidence: [],
    contributions: [],
    dismissedRecommendationKeys: [],
    previouslyOpenedKeys: [],
    northStarText: 'Lead with courage in my career.',
  });

  assert(recommendations.length >= 2, 'at least two strong matches');
  assert(recommendations.length <= FOCUS_RECOMMENDATION_MAX, 'finite set');
  const firstType = recommendations[0]?.type;
  assert(
    firstType === 'saved_thread' || firstType === 'starpath_step' || firstType === 'internal_resource',
    'internal first',
  );
  assert(
    !recommendations.some((rec) => String(rec.rankScore ?? 'hidden') !== 'hidden'),
    'rank score not exposed',
  );

  const guide = buildTodayFocusGuideResponse({
    session,
    recommendations,
    aiAssisted: true,
  });
  assert(guide.recommendations.every((rec) => !rec.whyRelevant.includes('0.')), 'no numeric scores');
  assert(guide.transparencyNote.includes('in control'), 'transparency');
}

function testDismissAndStableSession() {
  const fingerprint = fingerprintForFocusText('Prepare for my sales interview.');
  const sessionRow = {
    id: 'frs-focus-1',
    focusId: 'focus-1',
    userId: 'user-michael',
    generatedAt: Date.now(),
    recommendationIds: ['fr-1'],
    contextSnapshotId: 'ctx-1',
    status: 'active' as const,
    focusTextFingerprint: fingerprint,
    generationToken: 0,
  };
  const rec = {
    id: 'fr-1',
    userId: 'user-michael',
    focusId: 'focus-1',
    type: 'saved_thread' as const,
    title: 'Saved thread',
    summary: 'Interview prep',
    whyRelevant: 'Saved earlier',
    sourceType: 'saved_thread',
    sourceId: 'fixture-saved-interview-thread',
    destination: '/skywrite/saved/fixture-saved-interview-thread',
    relatedSkyAreaIds: ['career'],
    relatedStarPathIds: [],
    privacyScope: 'owner_only' as const,
    confidenceBand: 'high' as const,
    createdAt: Date.now(),
    provenanceIds: ['fixture-saved-interview-thread'],
    visualHint: 'saved' as const,
  };

  let state = upsertRecommendationSession(
    { sessions: [], recommendations: [], dismissedKeys: [], openedKeys: [] },
    sessionRow,
    [rec],
  );
  const stable = findStableSession(state, 'focus-1', fingerprint, 0);
  assert(Boolean(stable), 'stable session');

  state = markRecommendationDismissed(state, rec);
  assert(state.dismissedKeys.includes('saved_thread:fixture-saved-interview-thread'), 'dismiss key');
}

testInterviewFocusInternalFirst();
testDismissAndStableSession();

console.log('focusRecommendationEngine.test.ts — OK');
