import { EMPTY_SKYWRITE_LIBRARY_STATE } from '@/skywrite/library/skywriteLibraryTypes';
import {
  archiveCreatesLegacyMoment,
  buildSkywriteLifecycleView,
  createDeletionTombstone,
  isSkywriteDeleted,
  legacyEligibleFromArchiveOnly,
  legacySafeSummaryForDeletedSource,
  stripSkywriteRenderableContent,
} from '@/skywrite/lifecycle/skywriteContentLifecycle';
import { resolveSkywriteForDisplay } from '@/skywrite/lifecycle/resolveSkywriteForDisplay';
import { buildAuthoredLibraryRows } from '@/skywrite/library/buildMySkywritesLibrary';
import {
  confirmImpactEvent,
  deriveLivesImpacted,
} from '@/humanPotential/humanPotentialMetricsEngine';
import { EMPTY_HUMAN_POTENTIAL_METRICS_STATE } from '@/humanPotential/humanPotentialMetricsState';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(archiveCreatesLegacyMoment() === false, 'archive must not auto-create legacy');
assert(legacyEligibleFromArchiveOnly() === false, 'archive alone is not legacy eligible');

const post: SkywriteRecord & { authorId: string } = {
  id: 'sw-del-1',
  authorId: 'user-michael',
  text: 'Had coffee today.',
  textStyle: 'plain',
  media: { photo: { uri: 'file://photo.jpg', width: 100, height: 100 }, audio: null },
  mediaMode: 'photo',
  visibility: 'public',
  mood: null,
  showingUp: null,
  userHashtags: [],
  skyAreaId: 'growth',
  animateToSky: false,
  allowAIContext: true,
  createdAt: '2026-09-22T12:00:00.000Z',
};

const tombstone = createDeletionTombstone(post);
const library = {
  ...EMPTY_SKYWRITE_LIBRARY_STATE,
  deletionTombstonesBySkywriteId: { [post.id]: tombstone },
};
const lifecycle = buildSkywriteLifecycleView(library);

assert(isSkywriteDeleted(post.id, library.deletionTombstonesBySkywriteId), 'tombstone marks deleted');
assert(
  resolveSkywriteForDisplay([post], post.id, lifecycle) === null,
  'deleted skywrite hidden from display',
);

const stripped = stripSkywriteRenderableContent(post);
assert(stripped.text === '', 'strip removes text');
assert(stripped.media.photo === null && stripped.media.audio === null, 'strip removes media');

const safe = legacySafeSummaryForDeletedSource(tombstone);
assert(!safe.includes('coffee'), 'legacy safe summary hides deleted wording');

const archivedLibrary = {
  ...EMPTY_SKYWRITE_LIBRARY_STATE,
  archivedAtBySkywriteId: { [post.id]: Date.now() },
};
const archivedRows = buildAuthoredLibraryRows({
  localPosts: [post],
  library: archivedLibrary,
  tab: 'archived',
});
assert(archivedRows.length === 1 && archivedRows[0]!.excerpt.includes('coffee'), 'archive keeps content');

const deletedRows = buildAuthoredLibraryRows({
  localPosts: [post],
  library,
  tab: 'recent',
});
assert(deletedRows.length === 0, 'deleted authored post removed from recent');

const impactReflection: ThreadReflectionRecord = {
  reflectionId: 'refl-impact-del',
  savedThreadId: 'st-del',
  authorUserId: 'orbit-jordan',
  body: 'This helped me.',
  createdAt: 1000,
  updatedAt: 1000,
  deletedAt: null,
  visibility: 'private',
  momentKind: 'freeform',
};
let metrics = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
metrics = confirmImpactEvent({
  state: metrics,
  contributorUserId: 'user-michael',
  impactedUserId: 'orbit-jordan',
  reflection: impactReflection,
  savedThreadId: 'st-del',
  sourceSkywriteId: post.id,
  sourceThreadId: 'thread-sw-del-1',
  now: 1000,
}).state;
assert(deriveLivesImpacted('user-michael', metrics) === 1, 'impact before delete');
assert(
  deriveLivesImpacted('user-michael', metrics) === 1,
  'impact unchanged after tombstone (metrics store independent)',
);

console.log('skywriteContentLifecycle.test.ts — OK');
