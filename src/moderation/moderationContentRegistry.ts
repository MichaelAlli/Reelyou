import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ModerationReportTargetType } from '@/moderation/moderationTypes';

const STORAGE_KEY = '@reellyou/moderation-content-registry-v1';

export type ModerationContentDisposition = 'hidden' | 'removed';

export interface ModerationContentRecord {
  targetType: ModerationReportTargetType;
  targetId: string;
  disposition: ModerationContentDisposition;
  updatedAt: number;
  reportId?: string;
}

let cache: ModerationContentRecord[] | null = null;

function contentKey(targetType: ModerationReportTargetType, targetId: string): string {
  return `${targetType}:${targetId}`;
}

async function loadRecords(): Promise<ModerationContentRecord[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as ModerationContentRecord[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function saveRecords(records: ModerationContentRecord[]): Promise<void> {
  cache = records;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-200)));
  } catch {
    /* local beta */
  }
}

export async function registerModerationContentAction(
  targetType: ModerationReportTargetType,
  targetId: string,
  disposition: ModerationContentDisposition,
  reportId?: string,
): Promise<void> {
  const records = await loadRecords();
  const key = contentKey(targetType, targetId);
  const filtered = records.filter((entry) => contentKey(entry.targetType, entry.targetId) !== key);
  filtered.push({
    targetType,
    targetId,
    disposition,
    updatedAt: Date.now(),
    reportId,
  });
  await saveRecords(filtered);
}

export async function isModerationContentSuppressed(
  targetType: ModerationReportTargetType,
  targetId: string,
): Promise<boolean> {
  const records = await loadRecords();
  return records.some(
    (entry) =>
      entry.targetType === targetType &&
      entry.targetId === targetId &&
      (entry.disposition === 'hidden' || entry.disposition === 'removed'),
  );
}

/** Sync read for render paths after bootstrap warmed cache. */
export function isModerationContentSuppressedSync(
  targetType: ModerationReportTargetType,
  targetId: string,
): boolean {
  if (!cache) return false;
  return cache.some(
    (entry) =>
      entry.targetType === targetType &&
      entry.targetId === targetId &&
      (entry.disposition === 'hidden' || entry.disposition === 'removed'),
  );
}

export async function bootstrapModerationContentRegistry(
  seedRecords: readonly ModerationContentRecord[],
): Promise<void> {
  const records = await loadRecords();
  const existing = new Set(records.map((entry) => contentKey(entry.targetType, entry.targetId)));
  let changed = false;
  for (const seed of seedRecords) {
    const key = contentKey(seed.targetType, seed.targetId);
    if (existing.has(key)) continue;
    records.push(seed);
    existing.add(key);
    changed = true;
  }
  if (changed) await saveRecords(records);
}

export function clearModerationContentRegistryForTests(): void {
  cache = [];
}
