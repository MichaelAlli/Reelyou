import { currentUser } from '@/data/mockData';
import type { ContributionRecord } from '@/contributions/contributionTypes';
import { BETA_CONNECTED_USER_IDS } from '@/messages/messagesConnections';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import type { SkywriteResponseRecord } from '@/skywrite/threads/skywriteThreadTypes';
import type { SkywriteLibraryState } from '@/skywrite/library/skywriteLibraryTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { resolveSkywriteIntent, SKYWRITE_INTENT_OPTIONS } from '@/skywrite/skywriteIntent';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export type MySkywritesTabId = 'recent' | 'archived' | 'contributed';

export interface MySkywriteLibraryRow {
  skywriteId: string;
  skywrite: SkywriteRecord & { authorId: string };
  areaLabel: string | null;
  intentLabel: string | null;
  excerpt: string;
  sortMs: number;
  visibility: SkywriteRecord['visibility'];
  contributedResponseId?: string;
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
  blockedUserIds: readonly string[],
): boolean {
  if (blockedUserIds.includes(skywrite.authorId)) return false;
  if (skywrite.visibility === 'public') return true;
  if (skywrite.visibility === 'orbit') {
    return BETA_CONNECTED_USER_IDS.includes(skywrite.authorId);
  }
  return false;
}

export function buildAuthoredLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  library: SkywriteLibraryState;
  tab: 'recent' | 'archived';
  query?: string;
}): MySkywriteLibraryRow[] {
  const q = input.query?.trim().toLowerCase() ?? '';
  const rows: MySkywriteLibraryRow[] = [];

  for (const post of input.localPosts) {
    const record = { ...post, authorId: post.authorId ?? currentUser.id };
    if (!authoredByViewer(record)) continue;
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

export function buildContributedLibraryRows(input: {
  localPosts: readonly SkywriteRecord[];
  responses: readonly SkywriteResponseRecord[];
  contributions: readonly ContributionRecord[];
  blockedUserIds: readonly string[];
  query?: string;
}): MySkywriteLibraryRow[] {
  const q = input.query?.trim().toLowerCase() ?? '';
  const byResponse = new Map<string, SkywriteResponseRecord>();
  for (const response of input.responses) {
    if (response.responderId !== currentUser.id) continue;
    byResponse.set(response.responseId, response);
  }

  const rows: MySkywriteLibraryRow[] = [];
  const seenSkywrites = new Set<string>();

  for (const response of [...byResponse.values()].sort((a, b) => b.createdAt - a.createdAt)) {
    if (seenSkywrites.has(response.skywriteId)) continue;
    const skywrite = resolveSkywriteById(input.localPosts, response.skywriteId);
    if (!skywrite || skywrite.authorId === currentUser.id) continue;
    if (!contributorMayViewSkywrite(skywrite, input.blockedUserIds)) continue;

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
