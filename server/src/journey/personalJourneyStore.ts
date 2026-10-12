import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';

export interface StoredPersonalJourney {
  customTitle: string | null;
  orderedSkywriteIds: string[];
  updatedAt: number;
}

const MAX_TITLE_LENGTH = 80;

export function normalizeJourneyTitle(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.replace(/[\r\n\t]/g, ' ').trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_TITLE_LENGTH) return trimmed.slice(0, MAX_TITLE_LENGTH);
  return trimmed;
}

export function normalizeOrderedIds(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const ids = raw.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  return [...new Set(ids)];
}

function journeyMap(): Record<string, StoredPersonalJourney> {
  const db = loadAccountDatabase();
  if (!db.personalJourneys) {
    db.personalJourneys = {};
  }
  return db.personalJourneys;
}

export function getPersonalJourney(userId: string): StoredPersonalJourney {
  const entry = journeyMap()[userId];
  if (!entry) {
    return { customTitle: null, orderedSkywriteIds: [], updatedAt: 0 };
  }
  return {
    customTitle: entry.customTitle ?? null,
    orderedSkywriteIds: [...(entry.orderedSkywriteIds ?? [])],
    updatedAt: entry.updatedAt ?? 0,
  };
}

function skywriteEligibleForJourneyOrder(authorUserId: string, skywriteId: string): boolean {
  const db = loadAccountDatabase();
  const row = db.skywrites?.find((entry) => entry.id === skywriteId);
  if (!row || row.deletedAt) return false;
  if (row.authorUserId !== authorUserId) return false;
  return row.inYourJourney === true;
}

export function updatePersonalJourney(
  userId: string,
  patch: {
    customTitle?: unknown;
    orderedSkywriteIds?: unknown;
  },
): StoredPersonalJourney | { error: 'invalid_order' | 'invalid_title' } {
  const current = getPersonalJourney(userId);
  let customTitle = current.customTitle;
  let orderedSkywriteIds = current.orderedSkywriteIds;

  if (patch.customTitle !== undefined) {
    if (patch.customTitle === null || patch.customTitle === '') {
      customTitle = null;
    } else {
      const normalized = normalizeJourneyTitle(patch.customTitle);
      if (normalized === null && typeof patch.customTitle === 'string' && patch.customTitle.trim()) {
        return { error: 'invalid_title' };
      }
      customTitle = normalized;
    }
  }

  if (patch.orderedSkywriteIds !== undefined) {
    const normalized = normalizeOrderedIds(patch.orderedSkywriteIds);
    if (!normalized) return { error: 'invalid_order' };
    for (const id of normalized) {
      if (!skywriteEligibleForJourneyOrder(userId, id)) {
        return { error: 'invalid_order' };
      }
    }
    orderedSkywriteIds = normalized;
  }

  const next: StoredPersonalJourney = {
    customTitle,
    orderedSkywriteIds,
    updatedAt: Date.now(),
  };
  journeyMap()[userId] = next;
  persistAccountDatabase();
  return next;
}
