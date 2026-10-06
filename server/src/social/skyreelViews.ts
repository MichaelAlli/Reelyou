import { randomUUID } from 'node:crypto';

import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import { getSkywriteForViewer } from './socialRepository.js';

export interface StoredSkyreelView {
  id: string;
  skywriteId: string;
  viewerUserId: string;
  firstViewedAt: number;
  lastViewedAt: number;
}

function viewsTable(): StoredSkyreelView[] {
  const db = loadAccountDatabase();
  if (!db.skyreelViews) db.skyreelViews = [];
  return db.skyreelViews;
}

export function recordSkyreelView(
  skywriteId: string,
  viewerUserId: string,
  now = Date.now(),
): { ok: true } | { ok: false; error: string } {
  const row = getSkywriteForViewer(skywriteId, viewerUserId);
  if (!row) return { ok: false, error: 'not_found' };
  if (row.authorUserId === viewerUserId) return { ok: true };

  const existing = viewsTable().find(
    (v) => v.skywriteId === skywriteId && v.viewerUserId === viewerUserId,
  );
  if (existing) {
    existing.lastViewedAt = now;
    persistAccountDatabase();
    return { ok: true };
  }
  viewsTable().push({
    id: randomUUID(),
    skywriteId,
    viewerUserId,
    firstViewedAt: now,
    lastViewedAt: now,
  });
  persistAccountDatabase();
  return { ok: true };
}

export function listSkyreelViewersForOwner(
  ownerUserId: string,
  skywriteId: string,
): StoredSkyreelView[] {
  const row = getSkywriteForViewer(skywriteId, ownerUserId);
  if (!row || row.authorUserId !== ownerUserId) return [];
  return viewsTable()
    .filter((v) => v.skywriteId === skywriteId)
    .sort((a, b) => b.lastViewedAt - a.lastViewedAt);
}

export function countSkyreelViewers(skywriteId: string, ownerUserId: string): number {
  return listSkyreelViewersForOwner(ownerUserId, skywriteId).length;
}
