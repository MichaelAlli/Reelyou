import { randomUUID } from 'node:crypto';

import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import {
  ESTABLISHED_SKY_AREA_SEED,
  MAX_CUSTOM_SKY_AREAS_PER_SAVE,
  SKY_AREA_PROMOTION_THRESHOLD,
} from './skyAreaConstants.js';
import { normalizeSkyAreaName } from './normalizeSkyAreaName.js';

export type SkyAreaStatus = 'established' | 'emerging' | 'hidden';

export interface StoredSkyArea {
  id: string;
  canonicalName: string;
  normalizedName: string;
  status: SkyAreaStatus;
  createdAt: number;
  createdByUserId: string | null;
  uniqueUserCount: number;
  promotedAt: number | null;
  sortOrder: number;
}

export interface UserSkyAreaLink {
  userId: string;
  skyAreaId: string;
  createdAt: number;
}

function dbSkyAreas(): StoredSkyArea[] {
  const db = loadAccountDatabase();
  if (!db.skyAreas) db.skyAreas = [];
  return db.skyAreas;
}

function dbUserSkyAreas(): UserSkyAreaLink[] {
  const db = loadAccountDatabase();
  if (!db.userSkyAreas) db.userSkyAreas = [];
  return db.userSkyAreas;
}

export function ensureSkyAreaCatalogSeeded(): void {
  const areas = dbSkyAreas();
  if (areas.length > 0) return;
  const now = Date.now();
  for (const seed of ESTABLISHED_SKY_AREA_SEED) {
    areas.push({
      id: seed.id,
      canonicalName: seed.label,
      normalizedName: normalizeSkyAreaName(seed.label),
      status: 'established',
      createdAt: now,
      createdByUserId: null,
      uniqueUserCount: 0,
      promotedAt: null,
      sortOrder: seed.sortOrder,
    });
  }
  persistAccountDatabase();
}

function findAreaByNormalized(normalizedName: string): StoredSkyArea | undefined {
  ensureSkyAreaCatalogSeeded();
  return dbSkyAreas().find((area) => area.normalizedName === normalizedName);
}

function findAreaById(id: string): StoredSkyArea | undefined {
  ensureSkyAreaCatalogSeeded();
  return dbSkyAreas().find((area) => area.id === id);
}

function countUniqueUsersForArea(skyAreaId: string): number {
  const links = dbUserSkyAreas().filter((link) => link.skyAreaId === skyAreaId);
  return new Set(links.map((link) => link.userId)).size;
}

function refreshUniqueUserCount(area: StoredSkyArea): void {
  area.uniqueUserCount = countUniqueUsersForArea(area.id);
  if (
    area.status === 'emerging' &&
    area.uniqueUserCount >= SKY_AREA_PROMOTION_THRESHOLD &&
    area.promotedAt == null
  ) {
    area.status = 'established';
    area.promotedAt = Date.now();
  }
}

function linkUserToArea(userId: string, skyAreaId: string): void {
  const links = dbUserSkyAreas();
  const exists = links.some((link) => link.userId === userId && link.skyAreaId === skyAreaId);
  if (!exists) {
    links.push({ userId, skyAreaId, createdAt: Date.now() });
  }
}

function unlinkUserFromArea(userId: string, skyAreaId: string): void {
  const db = loadAccountDatabase();
  if (!db.userSkyAreas) return;
  db.userSkyAreas = db.userSkyAreas.filter(
    (link) => !(link.userId === userId && link.skyAreaId === skyAreaId),
  );
}

export function listSkyAreasForCatalog(options?: {
  search?: string;
  establishedOnly?: boolean;
  limit?: number;
}): StoredSkyArea[] {
  ensureSkyAreaCatalogSeeded();
  const q = normalizeSkyAreaName(options?.search ?? '');
  let rows = dbSkyAreas().filter((area) => area.status !== 'hidden');
  if (options?.establishedOnly) {
    rows = rows.filter((area) => area.status === 'established');
  }
  if (q) {
    rows = rows.filter(
      (area) =>
        area.normalizedName.includes(q) || area.canonicalName.toLowerCase().includes(q),
    );
  }
  rows.sort((a, b) => a.sortOrder - b.sortOrder || a.canonicalName.localeCompare(b.canonicalName));
  const limit = options?.limit ?? 200;
  return rows.slice(0, limit);
}

export function getUserSkyAreaSelection(userId: string): {
  skyAreaIds: string[];
  areas: StoredSkyArea[];
} {
  ensureSkyAreaCatalogSeeded();
  const ids = [
    ...new Set(
      dbUserSkyAreas()
        .filter((link) => link.userId === userId)
        .map((link) => link.skyAreaId),
    ),
  ];
  const areas = ids
    .map((id) => findAreaById(id))
    .filter((area): area is StoredSkyArea => Boolean(area));
  return { skyAreaIds: ids, areas };
}

export function resolveOrCreateSkyAreaForLabel(
  label: string,
  userId: string,
): { area: StoredSkyArea; reused: boolean; matchedEstablished: boolean } {
  ensureSkyAreaCatalogSeeded();
  const trimmed = label.trim().replace(/\s+/g, ' ');
  const normalized = normalizeSkyAreaName(trimmed);
  const existing = findAreaByNormalized(normalized);
  if (existing) {
    linkUserToArea(userId, existing.id);
    refreshUniqueUserCount(existing);
    persistAccountDatabase();
    return {
      area: existing,
      reused: true,
      matchedEstablished: existing.status === 'established',
    };
  }

  const now = Date.now();
  const area: StoredSkyArea = {
    id: randomUUID(),
    canonicalName: trimmed,
    normalizedName: normalized,
    status: 'emerging',
    createdAt: now,
    createdByUserId: userId,
    uniqueUserCount: 0,
    promotedAt: null,
    sortOrder: 900 + (now % 1000),
  };
  dbSkyAreas().push(area);
  linkUserToArea(userId, area.id);
  refreshUniqueUserCount(area);
  persistAccountDatabase();
  return { area, reused: false, matchedEstablished: false };
}

export function setUserSkyAreaSelection(
  userId: string,
  input: { establishedIds: string[]; customLabels: string[] },
):
  | { ok: true; skyAreaIds: string[]; areas: StoredSkyArea[] }
  | { ok: false; error: string } {
  ensureSkyAreaCatalogSeeded();
  const customLabels = input.customLabels
    .map((label) => label.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const dedupCustom: string[] = [];
  const seen = new Set<string>();
  for (const label of customLabels) {
    const norm = normalizeSkyAreaName(label);
    if (seen.has(norm)) continue;
    seen.add(norm);
    dedupCustom.push(label);
  }
  if (dedupCustom.length > MAX_CUSTOM_SKY_AREAS_PER_SAVE) {
    return { ok: false, error: 'max_custom_sky_areas' };
  }

  const establishedIds = [...new Set(input.establishedIds.filter(Boolean))];
  for (const id of establishedIds) {
    const area = findAreaById(id);
    if (!area || area.status === 'hidden') {
      return { ok: false, error: 'invalid_established_area' };
    }
  }

  const previous = getUserSkyAreaSelection(userId).skyAreaIds;
  for (const id of previous) {
    unlinkUserFromArea(userId, id);
  }

  const resolvedIds: string[] = [];
  for (const id of establishedIds) {
    linkUserToArea(userId, id);
    resolvedIds.push(id);
    const area = findAreaById(id);
    if (area) refreshUniqueUserCount(area);
  }

  for (const label of dedupCustom) {
    const { area } = resolveOrCreateSkyAreaForLabel(label, userId);
    if (!resolvedIds.includes(area.id)) resolvedIds.push(area.id);
  }

  persistAccountDatabase();
  const selection = getUserSkyAreaSelection(userId);
  return { ok: true, skyAreaIds: selection.skyAreaIds, areas: selection.areas };
}
