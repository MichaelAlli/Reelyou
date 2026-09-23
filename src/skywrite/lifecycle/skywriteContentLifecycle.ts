import type {
  SkywriteContentLifecycleView,
  SkywriteDeletionTombstone,
} from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import type { SkywriteLibraryState } from '@/skywrite/library/skywriteLibraryTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';

/** Archive moves items to rest — it never creates a Legacy moment. */
export function archiveCreatesLegacyMoment(): boolean {
  return false;
}

/** Legacy eligibility requires meaningful confirmed human-potential evidence elsewhere. */
export function legacyEligibleFromArchiveOnly(): boolean {
  return false;
}

export function createDeletionTombstone(
  post: SkywriteRecord & { authorId: string },
  now = Date.now(),
): SkywriteDeletionTombstone {
  return {
    skywriteId: post.id,
    ownerAuthorId: post.authorId,
    deletedAt: now,
    skyAreaId: post.skyAreaId,
    visibilitySnapshot: post.visibility,
    threadId: `thread-${post.id}`,
  };
}

/** Strip renderable content while retaining id for provenance lookups. */
export function stripSkywriteRenderableContent(post: SkywriteRecord): SkywriteRecord {
  return {
    ...post,
    text: '',
    media: { ...EMPTY_SKYWRITE_MEDIA },
    mediaMode: 'text',
    userHashtags: [],
    mood: null,
    showingUp: null,
  };
}

export function isSkywriteDeleted(
  skywriteId: string,
  tombstones: Readonly<Record<string, SkywriteDeletionTombstone>>,
): boolean {
  return typeof tombstones[skywriteId]?.deletedAt === 'number';
}

/** Safe Legacy copy — never exposes deleted wording or media. */
export function legacySafeSummaryForDeletedSource(
  tombstone: SkywriteDeletionTombstone,
): string {
  if (tombstone.skyAreaId) {
    return 'Something you shared in this area meaningfully helped someone.';
  }
  return 'Something you shared during this period meaningfully helped someone.';
}

export function buildSkywriteLifecycleView(
  library: Pick<
    SkywriteLibraryState,
    'archivedAtBySkywriteId' | 'deletionTombstonesBySkywriteId'
  >,
): SkywriteContentLifecycleView {
  const tombstones = library.deletionTombstonesBySkywriteId;
  return {
    isContentDeleted: (skywriteId) => isSkywriteDeleted(skywriteId, tombstones),
    tombstoneFor: (skywriteId) => tombstones[skywriteId],
    isArchived: (skywriteId) =>
      typeof library.archivedAtBySkywriteId[skywriteId] === 'number',
  };
}
