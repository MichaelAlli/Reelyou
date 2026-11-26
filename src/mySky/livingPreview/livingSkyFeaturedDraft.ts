import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import {
  applyLivingSkyFeaturedToggle,
  sanitizeLivingSkyFeaturedIds,
  type LivingSkyFeaturedToggle,
} from '@/mySky/livingPreview/livingSkyFeaturedLogic';

/**
 * DEVICE DRAFT — NOT CROSS-DEVICE.
 *
 * The owner's manual Sky Highlights choice is kept on this device so the
 * controls can be reviewed. Visitors never read it. It does not survive a
 * device change. Backend persistence is waiting on owner approval.
 */
export const LIVING_SKY_FEATURED_PERSISTENCE = 'device-draft-not-production' as const;

export type LivingSkyHighlightMode = 'automatic' | 'manual';

export interface LivingSkyHighlightPreference {
  mode: LivingSkyHighlightMode;
  ids: readonly string[];
}

interface DraftRecord {
  mode: LivingSkyHighlightMode;
  ids: string[];
}

const AUTOMATIC: DraftRecord = { mode: 'automatic', ids: [] };

const memory = new Map<string, DraftRecord>();
const hydrated = new Set<string>();
const dirty = new Set<string>();
const listeners = new Set<() => void>();

function storageKey(ownerId: string): string {
  return `@reellyou/living-sky-featured-draft/v1/${ownerId}`;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function parseStored(raw: string | null): DraftRecord {
  if (!raw) return { ...AUTOMATIC };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const ids = sanitizeLivingSkyFeaturedIds(parsed);
      return { mode: ids.length > 0 ? 'manual' : 'automatic', ids };
    }
    if (!parsed || typeof parsed !== 'object') return { ...AUTOMATIC };
    const record = parsed as { mode?: unknown; ids?: unknown };
    const ids = sanitizeLivingSkyFeaturedIds(Array.isArray(record.ids) ? record.ids : []);
    return { mode: record.mode === 'manual' ? 'manual' : 'automatic', ids };
  } catch {
    return { ...AUTOMATIC };
  }
}

function readRecord(ownerId: string): DraftRecord {
  return memory.get(ownerId) ?? { ...AUTOMATIC };
}

export function readLivingSkyHighlightPreference(ownerId: string): LivingSkyHighlightPreference {
  const record = readRecord(ownerId);
  return { mode: record.mode, ids: record.ids };
}

export function readLivingSkyFeaturedIds(ownerId: string): readonly string[] {
  return readRecord(ownerId).ids;
}

export function subscribeLivingSkyFeaturedIds(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hydrateLivingSkyFeaturedIds(ownerId: string): Promise<LivingSkyHighlightPreference> {
  if (!ownerId || dirty.has(ownerId) || hydrated.has(ownerId)) {
    return readLivingSkyHighlightPreference(ownerId);
  }
  try {
    const raw = await AsyncStorage.getItem(storageKey(ownerId));
    if (!dirty.has(ownerId)) memory.set(ownerId, parseStored(raw));
  } catch {
    if (!dirty.has(ownerId) && !memory.has(ownerId)) memory.set(ownerId, { ...AUTOMATIC });
  }
  hydrated.add(ownerId);
  emit();
  return readLivingSkyHighlightPreference(ownerId);
}

async function persist(ownerId: string, record: DraftRecord): Promise<void> {
  hydrated.add(ownerId);
  try {
    await AsyncStorage.setItem(storageKey(ownerId), JSON.stringify(record));
  } catch {
    /* draft stays in memory for this session */
  }
}

function writeRecord(ownerId: string, record: DraftRecord): void {
  dirty.add(ownerId);
  memory.set(ownerId, { mode: record.mode, ids: sanitizeLivingSkyFeaturedIds(record.ids) });
  emit();
  void persist(ownerId, readRecord(ownerId));
}

export function setLivingSkyHighlightMode(ownerId: string, mode: LivingSkyHighlightMode): void {
  if (!ownerId) return;
  const current = readRecord(ownerId);
  if (current.mode === mode) return;
  writeRecord(ownerId, { mode, ids: current.ids });
}

export function toggleLivingSkyFeaturedId(ownerId: string, postId: string): LivingSkyFeaturedToggle {
  const result = applyLivingSkyFeaturedToggle(readRecord(ownerId).ids, postId);
  if (!result.changed) return result;
  writeRecord(ownerId, { mode: 'manual', ids: result.ids });
  return result;
}

export function clearLivingSkyFeaturedIds(ownerId: string): void {
  setLivingSkyHighlightMode(ownerId, 'automatic');
}

const EMPTY_PREFERENCE: LivingSkyHighlightPreference = { mode: 'automatic', ids: [] };
let draftNoticeShown = false;

export function consumeLivingSkyFeaturedDraftNotice(): boolean {
  if (draftNoticeShown) return false;
  draftNoticeShown = true;
  return true;
}

export function useLivingSkyHighlightPreference(
  ownerId: string | null | undefined,
  enabled: boolean,
): LivingSkyHighlightPreference {
  const [preference, setPreference] = useState<LivingSkyHighlightPreference>(EMPTY_PREFERENCE);

  useEffect(() => {
    if (!enabled || !ownerId) {
      setPreference(EMPTY_PREFERENCE);
      return;
    }
    let active = true;
    const apply = () => {
      if (active) setPreference(readLivingSkyHighlightPreference(ownerId));
    };
    apply();
    void hydrateLivingSkyFeaturedIds(ownerId).then(apply);
    const unsubscribe = subscribeLivingSkyFeaturedIds(apply);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled, ownerId]);

  return enabled && ownerId ? preference : EMPTY_PREFERENCE;
}

export function useLivingSkyFeaturedIds(
  ownerId: string | null | undefined,
  enabled: boolean,
): readonly string[] {
  return useLivingSkyHighlightPreference(ownerId, enabled).ids;
}
