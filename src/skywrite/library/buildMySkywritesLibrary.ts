import { currentUser, orbitUsers } from '@/data/mockData';
import type { ContributionRecord } from '@/contributions/contributionTypes';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import {
  buildSkywriteLifecycleView,
  isSkywriteDeleted,
} from '@/skywrite/lifecycle/skywriteContentLifecycle';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import type { SkywriteResponseRecord } from '@/skywrite/threads/skywriteThreadTypes';
import type { SkywriteLibraryState } from '@/skywrite/library/skywriteLibraryTypes';
import type { SavedThreadsState } from '@/skywrite/savedThreads/savedThreadTypes';
import { latestReflectionAt } from '@/skywrite/savedThreads/savedThreadLogic';
import { resolveSavedThreadSourceAccess } from '@/skywrite/savedThreads/savedThreadAccess';
import type { SkywriteRecord } from '@/skywrite/types';
import { resolveSkywriteIntent, SKYWRITE_INTENT_OPTIONS } from '@/skywrite/skywriteIntent';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export type MySkywritesTabId = 'recent' | 'saved' | 'archived' | 'contributed';

export interface MySkywriteLibraryRow {
  skywriteId: string;
  skywrite: SkywriteRecord & { authorId: string };
  areaLabel: string | null;
  intentLabel: string | null;
  excerpt: string;
  sortMs: number;
  visibility: SkywriteRecord['visibility'];
  contributedResponseId?: string;
  savedThreadId?: string;
  latestReflectionAt?: number | null;
}

function areaLabelFor(skyAreaId: string | undefined): string | null {
  if (!skyAreaId) return null;
  if (isSkyAreaCategoryId(skyAreaId)) return getSkyAreaCategory(skyAreaId).label;
  return skyAreaId.replace(/^custom-/, '').replace(/-/g, ' ');
}

function intentLabelFor(record: SkywriteRecord): string | null {
  const intent = resolveSkywriteIntent(record);
  return SKYWRITE_INTENT_OPTIONS.find((option) => option.id === intent)?.label ?? null;
}

function excerpt(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'Skywrite';
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}…`;
}

function isArchived(library: SkywriteLibraryState, skywriteId: string): boolean {
  return typeof library.archivedAtBySkywriteId[skywriteId] === 'number';
}

function authoredByViewer(record: SkywriteRecord & { authorId: string }): boolean {
  return record.authorId === currentUser.id;
}

function contributorMayViewSkywrite(
  skywrite: SkywriteRecord & { authorId: string },
  input: {
    viewerId: string;
    followGraph: SkyFollowGraph;
    blockedUserIds: readonly string[];
  },
): boolean {
  return resolveSkywriteViewerAccess({
    viewerId: input.viewerId,
    authorId: skywrite.authorId,
    visibility: skywrite.visibility,
    followGraph: input.followGraph,
    blockedUserIds: input.blockedUserIds,
  });
}

export function buildAuthoredLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  tab: 'recent' | 'archived';
  query?: string;
}): MySkywriteLibraryRow[] {
  const q = input.query?.trim().toLowerCase() ?? '';
  const rows: MySkywriteLibraryRow[] = [];
  const lifecycle = buildSkywriteLifecycleView(input.library);

  for (const post of input.localPosts) {
    const record = { ...post, authorId: post.authorId ?? currentUser.id };
    if (!authoredByViewer(record)) continue;
    if (isSkywriteDeleted(record.id, input.library.deletionTombstonesBySkywriteId)) continue;
    const archived = isArchived(input.library, record.id);
    if (input.tab === 'recent' && archived) continue;
    if (input.tab === 'archived' && !archived) continue;

    const areaLabel = areaLabelFor(record.skyAreaId);
    const excerptText = excerpt(record.text);
    if (q) {
      const haystack = `${excerptText} ${areaLabel ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) continue;
    }

    rows.push({
      skywriteId: record.id,
      skywrite: record,
      areaLabel,
      intentLabel: intentLabelFor(record),
      excerpt: excerptText,
      sortMs:
        input.tab === 'archived'
          ? input.library.archivedAtBySkywriteId[record.id] ?? Date.parse(record.createdAt)
          : Date.parse(record.createdAt) || 0,
      visibility: record.visibility,
    });
  }

  return rows.sort((a, b) => b.sortMs - a.sortMs);
}

function authorName(userId: string): string | null {
  return orbitUsers.find((user) => user.id === userId)?.name ?? null;
}

function buildSavedThreadRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  saved: SavedThreadsState;
  contributions: readonly ContributionRecord[];
  blockedUserIds: readonly string[];
  status: 'active' | 'archived';
  query?: string;
}): MySkywriteLibraryRow[] {
  const q = input.query?.trim().toLowerCase() ?? '';
  const rows: MySkywriteLibraryRow[] = [];
  const lifecycle = buildSkywriteLifecycleView(input.library);

  for (const saved of input.saved.savedThreads) {
    if (saved.ownerUserId !== currentUser.id) continue;
    if (saved.status !== input.status) continue;
    const sourceDeleted = isSkywriteDeleted(
      saved.skywriteId,
      input.library.deletionTombstonesBySkywriteId,
    );
    const skywrite = resolveSkywriteById(input.localPosts, saved.skywriteId, lifecycle);
    const access = resolveSavedThreadSourceAccess({
      skywrite: skywrite ? { ...skywrite, authorId: skywrite.authorId ?? saved.originalAuthorId } : null,
      blockedUserIds: input.blockedUserIds,
      viewerId: currentUser.id,
    });
    const authorLabel = authorName(saved.originalAuthorId);
    const areaLabel = areaLabelFor(saved.skyAreaId ?? skywrite?.skyAreaId);
    const baseText = skywrite?.text ?? '';
    const excerptText = excerpt(baseText || 'Saved thread');
    const reflectionAt = latestReflectionAt(input.saved, saved.savedThreadId);
    const hasContribution = input.contributions.some(
      (entry) => entry.sourceSkywriteId === saved.skywriteId && entry.state === 'active',
    );

    if (q) {
      const reflectionHay = input.saved.reflections
        .filter((entry) => entry.savedThreadId === saved.savedThreadId && !entry.deletedAt)
        .map((entry) => entry.body)
        .join(' ');
      const haystack =
        `${excerptText} ${areaLabel ?? ''} ${authorLabel ?? ''} ${reflectionHay}`.toLowerCase();
      if (!haystack.includes(q)) continue;
    }

    const hideSourceContent =
      sourceDeleted || !skywrite || (input.status === 'active' && access === 'inaccessible');

    if (hideSourceContent) {
      rows.push({
        skywriteId: saved.skywriteId,
        skywrite: {
          id: saved.skywriteId,
          text: '',
          visibility: saved.visibilitySnapshot,
          authorId: saved.originalAuthorId,
          createdAt: new Date(saved.savedAt).toISOString(),
          media: { photo: null, audio: null },
          mediaMode: 'text',
          mood: null,
          showingUp: null,
          userHashtags: [],
          animateToSky: false,
          allowAIContext: false,
          textStyle: 'plain',
        },
        areaLabel,
        intentLabel: hasContribution ? 'Contribution saved' : authorLabel ? `With ${authorLabel}` : 'Saved thread',
        excerpt: 'Conversation unavailable',
        sortMs: Math.max(saved.lastVisitedAt, reflectionAt ?? 0, saved.savedAt),
        visibility: saved.visibilitySnapshot,
        savedThreadId: saved.savedThreadId,
        latestReflectionAt: reflectionAt,
      });
      continue;
    }
    rows.push({
      skywriteId: skywrite.id,
      skywrite: { ...skywrite, authorId: skywrite.authorId ?? saved.originalAuthorId },
      areaLabel,
      intentLabel: hasContribution ? 'Contribution saved' : authorLabel ? `With ${authorLabel}` : 'Saved thread',
      excerpt: excerptText,
      sortMs: Math.max(saved.lastVisitedAt, reflectionAt ?? 0, saved.savedAt),
      visibility: skywrite.visibility,
      savedThreadId: saved.savedThreadId,
      latestReflectionAt: reflectionAt,
    });
  }

  return rows.sort((a, b) => b.sortMs - a.sortMs);
}

export function buildSavedThreadLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  saved: SavedThreadsState;
  contributions: readonly ContributionRecord[];
  blockedUserIds: readonly string[];
  query?: string;
}): MySkywriteLibraryRow[] {
  return buildSavedThreadRows({ ...input, status: 'active' });
}

export function buildArchivedSavedThreadLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  saved: SavedThreadsState;
  contributions: readonly ContributionRecord[];
  blockedUserIds: readonly string[];
  query?: string;
}): MySkywriteLibraryRow[] {
  return buildSavedThreadRows({ ...input, status: 'archived' });
}

export function buildContributedLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  responses: readonly SkywriteResponseRecord[];
  contributions: readonly ContributionRecord[];
  blockedUserIds: readonly string[];
  followGraph: SkyFollowGraph;
  query?: string;
}): MySkywriteLibraryRow[] {
  const q = input.query?.trim().toLowerCase() ?? '';
  const lifecycle = buildSkywriteLifecycleView(input.library);
  const byResponse = new Map<string, SkywriteResponseRecord>();
  for (const response of input.responses) {
    if (response.responderId !== currentUser.id) continue;
    byResponse.set(response.responseId, response);
  }

  const rows: MySkywriteLibraryRow[] = [];
  const seenSkywrites = new Set<string>();

  for (const response of [...byResponse.values()].sort((a, b) => b.createdAt - a.createdAt)) {
    if (seenSkywrites.has(response.skywriteId)) continue;
    if (
      isSkywriteDeleted(response.skywriteId, input.library.deletionTombstonesBySkywriteId)
    ) {
      continue;
    }
    const skywrite = resolveSkywriteById(input.localPosts, response.skywriteId, lifecycle);
    if (!skywrite || skywrite.authorId === currentUser.id) continue;
    if (
      !contributorMayViewSkywrite(skywrite, {
        viewerId: currentUser.id,
        followGraph: input.followGraph,
        blockedUserIds: input.blockedUserIds,
      })
    ) {
      continue;
    }

    seenSkywrites.add(response.skywriteId);
    const areaLabel = areaLabelFor(skywrite.skyAreaId);
    const excerptText = excerpt(response.body.trim() || skywrite.text);
    if (q) {
      const haystack = `${excerptText} ${areaLabel ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) continue;
    }

    const savedContribution = input.contributions.find(
      (entry) =>
        entry.sourceResponseId === response.responseId &&
        entry.responderId === currentUser.id &&
        entry.state === 'active',
    );

    rows.push({
      skywriteId: skywrite.id,
      skywrite,
      areaLabel,
      intentLabel: savedContribution ? 'Contribution saved' : intentLabelFor(skywrite),
      excerpt: excerptText,
      sortMs: response.createdAt,
      visibility: skywrite.visibility,
      contributedResponseId: response.responseId,
    });
  }

  return rows;
}
