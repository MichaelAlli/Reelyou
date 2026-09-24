import { currentUser } from '@/data/mockData';
import { contributionIdForResponse } from '@/contributions/contributionTypes';
import {
  addApplicationEvidence,
  addLearningEvidence,
  confirmImpactEvent,
  createRippleEvent,
  deriveLivesImpacted,
} from '@/humanPotential/humanPotentialMetricsEngine';
import { EMPTY_HUMAN_POTENTIAL_METRICS_STATE } from '@/humanPotential/humanPotentialMetricsState';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import type { ContributionRecord } from '@/contributions/contributionTypes';
import type { SkywriteLibraryState } from '@/skywrite/library/skywriteLibraryTypes';
import { EMPTY_SKYWRITE_LIBRARY_STATE } from '@/skywrite/library/skywriteLibraryTypes';
import type { SkywriteResponseRecord, SkywriteThreadState } from '@/skywrite/threads/skywriteThreadTypes';
import { EMPTY_SKYWRITE_THREAD_STATE } from '@/skywrite/threads/skywriteThreadTypes';
import type { SavedThreadsState, ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import { EMPTY_SAVED_THREADS_STATE, savedThreadIdFor } from '@/skywrite/savedThreads/savedThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import type { SkywritesState } from '@/skywrite/types';
import { EMPTY_SKYWRITES } from '@/skywrite/types';
import { createDeletionTombstone } from '@/skywrite/lifecycle/skywriteContentLifecycle';

export const LEGACY_DEMO_SEED_VERSION = 1;
export const LEGACY_DEMO_SEED_VERSION_KEY = '@reellyou/legacy-demo-seed-version';

export const LEGACY_DEMO_SKYWRITE_PREFIX = 'legacy-demo-sw-';

export const LEGACY_DEMO_IDS = {
  jordanThread: `${LEGACY_DEMO_SKYWRITE_PREFIX}jordan-career`,
  michaelCareer: `${LEGACY_DEMO_SKYWRITE_PREFIX}michael-transition`,
  michaelImage: `${LEGACY_DEMO_SKYWRITE_PREFIX}michael-image-lesson`,
  michaelDeleted: `${LEGACY_DEMO_SKYWRITE_PREFIX}michael-deleted-impact`,
  jordanResponse: 'legacy-demo-resp-jordan',
  michaelContribution: contributionIdForResponse(
    `${LEGACY_DEMO_SKYWRITE_PREFIX}jordan-career`,
    'legacy-demo-resp-michael',
  ),
} as const;

const OWNER = currentUser.id;
const JORDAN = 'orbit-jordan';
const ALEX = 'orbit-1';
const PRIYA = 'sky-3';

const T0 = Date.parse('2025-06-15T12:00:00.000Z');
const T1 = Date.parse('2025-08-01T12:00:00.000Z');
const T2 = Date.parse('2025-09-10T12:00:00.000Z');
const T3 = Date.parse('2025-10-05T12:00:00.000Z');
const T4 = Date.parse('2025-11-12T12:00:00.000Z');
const T5 = Date.parse('2026-01-20T12:00:00.000Z');
const T6 = Date.parse('2026-03-08T12:00:00.000Z');

function reflection(
  id: string,
  savedThreadId: string,
  authorUserId: string,
  body: string,
  createdAt: number,
  extra?: Partial<ThreadReflectionRecord>,
): ThreadReflectionRecord {
  return {
    reflectionId: id,
    savedThreadId,
    authorUserId,
    body,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    visibility: 'private',
    momentKind: extra?.momentKind ?? 'freeform',
    microChoice: extra?.microChoice,
    audioUri: extra?.audioUri ?? null,
    audioDurationMs: extra?.audioDurationMs ?? null,
    emotionalTags: extra?.emotionalTags,
    sourceResponseId: extra?.sourceResponseId,
    sourceContributionId: extra?.sourceContributionId,
  };
}

export function buildLegacyDemoSkywrites(): Array<SkywriteRecord & { authorId: string }> {
  return [
    {
      id: LEGACY_DEMO_IDS.jordanThread,
      authorId: JORDAN,
      text: 'Navigating a career crossroads — what helped you when work and purpose felt misaligned?',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: 'reflective',
      showingUp: 'question',
      intent: 'question',
      userHashtags: ['career'],
      skyAreaId: 'career',
      animateToSky: false,
      allowAIContext: true,
      createdAt: new Date(T1).toISOString(),
    },
    {
      id: LEGACY_DEMO_IDS.michaelCareer,
      authorId: OWNER,
      text: 'I am closing one chapter at work and trying to trust what comes next.',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: 'determined',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['career'],
      skyAreaId: 'career',
      animateToSky: false,
      allowAIContext: true,
      createdAt: new Date(T0).toISOString(),
    },
    {
      id: LEGACY_DEMO_IDS.michaelImage,
      authorId: OWNER,
      text: 'What I learned rebuilding after a difficult season.',
      textStyle: 'plain',
      media: {
        photo: {
          uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          width: 800,
          height: 600,
        },
        audio: null,
      },
      mediaMode: 'photo',
      visibility: 'public',
      mood: 'hopeful',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['growth'],
      skyAreaId: 'growth',
      animateToSky: false,
      allowAIContext: true,
      createdAt: new Date(T2).toISOString(),
    },
    {
      id: LEGACY_DEMO_IDS.michaelDeleted,
      authorId: OWNER,
      text: '',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: null,
      showingUp: null,
      userHashtags: [],
      skyAreaId: 'growth',
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date(T3).toISOString(),
    },
  ];
}

export function buildLegacyDemoSavedThreadsState(): SavedThreadsState {
  const stJordan = savedThreadIdFor(OWNER, LEGACY_DEMO_IDS.jordanThread);
  const stMichaelCareer = savedThreadIdFor(OWNER, LEGACY_DEMO_IDS.michaelCareer);

  const reflections: ThreadReflectionRecord[] = [
    reflection(
      'legacy-demo-refl-career-growth',
      stMichaelCareer,
      OWNER,
      'I was navigating a real career transition and needed to trust the next step.',
      T0,
      { momentKind: 'perspective', emotionalTags: ['direction'] },
    ),
    reflection(
      'legacy-demo-refl-less-alone',
      stJordan,
      OWNER,
      'Jordan showed up in a way that made me feel less alone in the transition.',
      T1,
      { momentKind: 'less_alone', emotionalTags: ['less_alone', 'supported'] },
    ),
    reflection(
      'legacy-demo-refl-hope',
      stMichaelCareer,
      OWNER,
      'This gave me hope that I could move forward without having every answer.',
      T2,
      { momentKind: 'hope', emotionalTags: ['hope'] },
    ),
    reflection(
      'legacy-demo-refl-belonging',
      stJordan,
      OWNER,
      'I found people going through something similar — I felt like I belonged again.',
      T3,
      { momentKind: 'stayed_with_me', emotionalTags: ['supported'] },
    ),
    reflection(
      'legacy-demo-refl-application',
      stJordan,
      OWNER,
      'I applied what I learned here before a difficult conversation at work.',
      T4,
      { momentKind: 'used_this', sourceContributionId: LEGACY_DEMO_IDS.michaelContribution },
    ),
    reflection(
      'legacy-demo-refl-audio-growth',
      stMichaelCareer,
      OWNER,
      'Voice note — what stayed with me after that season.',
      T5,
      {
        momentKind: 'freeform',
        audioUri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        audioDurationMs: 18000,
      },
    ),
    reflection(
      'legacy-demo-refl-impact-jordan-1',
      stJordan,
      JORDAN,
      'Michael’s response helped me move forward in my own career decision.',
      T4 + 86400000,
      { sourceContributionId: LEGACY_DEMO_IDS.michaelContribution },
    ),
    reflection(
      'legacy-demo-refl-impact-jordan-2',
      stJordan,
      JORDAN,
      'Months later, that same thread still helped me prepare for a hard conversation.',
      T5,
      { sourceContributionId: LEGACY_DEMO_IDS.michaelContribution },
    ),
    reflection(
      'legacy-demo-refl-impact-jordan-3',
      stJordan,
      JORDAN,
      'It meaningfully helped me change what I did next at work.',
      T6,
      { sourceContributionId: LEGACY_DEMO_IDS.michaelContribution },
    ),
    reflection(
      'legacy-demo-refl-impact-alex',
      'st-orbit-1-legacy-demo-sw-alex',
      ALEX,
      'What Michael shared helped me move forward with my interview prep.',
      T5 + 3600000,
    ),
    reflection(
      'legacy-demo-refl-impact-priya',
      'st-sky-3-legacy-demo-sw-priya',
      PRIYA,
      'Michael’s experience became useful when I was stuck in my own transition.',
      T6 + 3600000,
    ),
    reflection(
      'legacy-demo-refl-support-michael',
      stJordan,
      OWNER,
      'Jordan checked in when I needed it most — I felt supported.',
      T1 + 3600000,
    ),
    reflection(
      'legacy-demo-refl-impact-deleted-src',
      stJordan,
      JORDAN,
      'Something Michael shared during that season meaningfully helped me.',
      T3 + 2000,
      { sourceContributionId: LEGACY_DEMO_IDS.michaelContribution },
    ),
  ];

  const savedThreads = [
    {
      savedThreadId: stJordan,
      ownerUserId: OWNER,
      skywriteId: LEGACY_DEMO_IDS.jordanThread,
      threadId: `thread-${LEGACY_DEMO_IDS.jordanThread}`,
      skyAreaId: 'career',
      originalAuthorId: JORDAN,
      visibilitySnapshot: 'public' as const,
      savedAt: T1,
      lastVisitedAt: T6,
      visitCount: 4,
      archivedAt: null,
      status: 'active' as const,
      createdAt: T1,
      updatedAt: T6,
    },
    {
      savedThreadId: stMichaelCareer,
      ownerUserId: OWNER,
      skywriteId: LEGACY_DEMO_IDS.michaelCareer,
      threadId: `thread-${LEGACY_DEMO_IDS.michaelCareer}`,
      skyAreaId: 'career',
      originalAuthorId: OWNER,
      visibilitySnapshot: 'private' as const,
      savedAt: T0,
      lastVisitedAt: T5,
      visitCount: 2,
      archivedAt: T6,
      status: 'archived' as const,
      createdAt: T0,
      updatedAt: T6,
    },
  ];

  return {
    savedThreads,
    reflections,
    evidence: [],
    updatedAt: T6,
  };
}

export function buildLegacyDemoContributions(): ContributionRecord[] {
  return [
    {
      contributionId: LEGACY_DEMO_IDS.michaelContribution,
      responderId: OWNER,
      sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
      sourceThreadId: `thread-${LEGACY_DEMO_IDS.jordanThread}`,
      sourceResponseId: 'legacy-demo-resp-michael',
      skyAreaId: 'career',
      contributionType: 'skywrite_response',
      state: 'active',
      createdAt: T2,
      savedAt: T2,
    },
  ];
}

export function buildLegacyDemoThreadState(): SkywriteThreadState {
  const responses: SkywriteResponseRecord[] = [
    {
      responseId: 'legacy-demo-resp-michael',
      skywriteId: LEGACY_DEMO_IDS.jordanThread,
      threadId: `thread-${LEGACY_DEMO_IDS.jordanThread}`,
      responderId: OWNER,
      body: 'When I changed roles, what helped most was naming what mattered before chasing the next title.',
      createdAt: T2,
      visibility: 'public',
      savedByAuthor: true,
      savedAt: T2,
    },
    {
      responseId: LEGACY_DEMO_IDS.jordanResponse,
      skywriteId: LEGACY_DEMO_IDS.jordanThread,
      threadId: `thread-${LEGACY_DEMO_IDS.jordanThread}`,
      responderId: JORDAN,
      body: 'Thank you — this landed when I needed perspective.',
      createdAt: T2 + 3600000,
      visibility: 'public',
      savedByAuthor: false,
      savedAt: null,
    },
  ];
  return { ...EMPTY_SKYWRITE_THREAD_STATE, responses };
}

export function buildLegacyDemoMetricsState(): HumanPotentialMetricsState {
  const stJordan = savedThreadIdFor(OWNER, LEGACY_DEMO_IDS.jordanThread);
  const stMichaelCareer = savedThreadIdFor(OWNER, LEGACY_DEMO_IDS.michaelCareer);
  const saved = buildLegacyDemoSavedThreadsState();
  const byId = (id: string) => saved.reflections.find((entry) => entry.reflectionId === id)!;

  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;

  state = addLearningEvidence({
    state,
    userId: OWNER,
    reflection: byId('legacy-demo-refl-career-growth'),
    savedThreadId: stMichaelCareer,
    sourceSkywriteId: LEGACY_DEMO_IDS.michaelCareer,
    now: T0,
  });
  state = addLearningEvidence({
    state,
    userId: OWNER,
    reflection: byId('legacy-demo-refl-less-alone'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    now: T1,
  });
  state = addLearningEvidence({
    state,
    userId: OWNER,
    reflection: byId('legacy-demo-refl-hope'),
    savedThreadId: stMichaelCareer,
    sourceSkywriteId: LEGACY_DEMO_IDS.michaelCareer,
    now: T2,
  });
  state = addLearningEvidence({
    state,
    userId: OWNER,
    reflection: byId('legacy-demo-refl-belonging'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    now: T3,
  });

  state = addApplicationEvidence({
    state,
    userId: OWNER,
    reflection: byId('legacy-demo-refl-application'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    sourceThreadId: `thread-${LEGACY_DEMO_IDS.jordanThread}`,
    contributionId: LEGACY_DEMO_IDS.michaelContribution,
    now: T4,
  });

  const impactJordan1 = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: JORDAN,
    reflection: byId('legacy-demo-refl-impact-jordan-1'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    contributionId: LEGACY_DEMO_IDS.michaelContribution,
    skyAreaId: 'career',
    now: T4 + 86400000,
  });
  state = impactJordan1.state;

  state = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: JORDAN,
    reflection: byId('legacy-demo-refl-impact-jordan-2'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    contributionId: LEGACY_DEMO_IDS.michaelContribution,
    now: T5,
  }).state;

  state = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: JORDAN,
    reflection: byId('legacy-demo-refl-impact-jordan-3'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    contributionId: LEGACY_DEMO_IDS.michaelContribution,
    now: T6,
  }).state;

  state = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: ALEX,
    reflection: byId('legacy-demo-refl-impact-alex'),
    savedThreadId: 'st-orbit-1-legacy-demo-sw-alex',
    sourceSkywriteId: LEGACY_DEMO_IDS.michaelImage,
    skyAreaId: 'growth',
    now: T5 + 3600000,
  }).state;

  state = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: PRIYA,
    reflection: byId('legacy-demo-refl-impact-priya'),
    savedThreadId: 'st-sky-3-legacy-demo-sw-priya',
    sourceSkywriteId: LEGACY_DEMO_IDS.michaelImage,
    skyAreaId: 'growth',
    now: T6 + 3600000,
  }).state;

  state = confirmImpactEvent({
    state,
    contributorUserId: JORDAN,
    impactedUserId: OWNER,
    reflection: byId('legacy-demo-refl-support-michael'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.jordanThread,
    now: T1 + 7200000,
  }).state;

  const firstImpactId = impactJordan1.impactEvent.impactEventId;
  state = createRippleEvent({
    state,
    originatingContributorUserId: OWNER,
    directImpactedUserId: JORDAN,
    downstreamUserId: ALEX,
    parentImpactEventId: firstImpactId,
    parentContributionId: LEGACY_DEMO_IDS.michaelContribution,
    userConfirmed: true,
    now: T6 + 7200000,
  });

  state = confirmImpactEvent({
    state,
    contributorUserId: OWNER,
    impactedUserId: JORDAN,
    reflection: byId('legacy-demo-refl-impact-deleted-src'),
    savedThreadId: stJordan,
    sourceSkywriteId: LEGACY_DEMO_IDS.michaelDeleted,
    skyAreaId: 'growth',
    now: T3 + 2000,
  }).state;

  if (deriveLivesImpacted(OWNER, state) !== 3) {
    throw new Error(`Legacy demo seed: expected 3 lives impacted, got ${deriveLivesImpacted(OWNER, state)}`);
  }

  return state;
}

export function buildLegacyDemoLibraryState(): SkywriteLibraryState {
  const deletedPost = buildLegacyDemoSkywrites().find(
    (entry) => entry.id === LEGACY_DEMO_IDS.michaelDeleted,
  )!;
  const tombstone = createDeletionTombstone(deletedPost, T3);
  return {
    ...EMPTY_SKYWRITE_LIBRARY_STATE,
    archivedAtBySkywriteId: {
      [LEGACY_DEMO_IDS.michaelCareer]: T6,
    },
    deletionTombstonesBySkywriteId: {
      [LEGACY_DEMO_IDS.michaelDeleted]: tombstone,
    },
    updatedAt: T6,
  };
}

export function buildLegacyDemoLocalSkywrites(): SkywritesState {
  const demo = buildLegacyDemoSkywrites().filter((entry) => entry.authorId === OWNER);
  return { posts: demo };
}

export async function shouldApplyLegacyDemoSeed(): Promise<boolean> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const version = await AsyncStorage.getItem(LEGACY_DEMO_SEED_VERSION_KEY);
  return version !== String(LEGACY_DEMO_SEED_VERSION);
}

export async function markLegacyDemoSeedApplied(): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.setItem(LEGACY_DEMO_SEED_VERSION_KEY, String(LEGACY_DEMO_SEED_VERSION));
}
