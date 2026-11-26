import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import {
  applyLivingSkyFeaturedToggle,
  sanitizeLivingSkyFeaturedIds,
  type LivingSkyFeaturedToggle,
} from '@/mySky/livingPreview/livingSkyFeaturedLogic';

/**
 * DEVICE DRAFT — NOT PRODUCTION.
 *
 * Manual Sky featuring is stored on this device so the owner can preview it.
 * It is not synced, and visitors never read another account's draft.
 *
 * Approved backend shape (not implemented — needs owner approval, no SQL migration):
 * optional `featuredSkywriteIds: string[]` (max 3) on StoredUser inside the
 * existing `reellyou_app_state` JSONB payload, written only by the owner through
 * the current profile update path after id and privacy checks.
 */
export const LIVING_SKY_FEATURED_PERSISTENCE = 'device-draft-not-production' as const;

const memory = new Map<string, string[]>();
const hydrated = new Set<string>();
const dirty = new Set<string>();
const listeners = new Set<() => void>();

function storageKey(ownerId: string): string {
  return `@reellyou/living-sky-featured-draft/v1/${ownerId}`;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function readLivingSkyFeaturedIds(ownerId: string): readonly string[] {
  return memory.get(ownerId) ?? [];
}

export function subscribeLivingSkyFeaturedIds(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hydrateLivingSkyFeaturedIds(ownerId: string): Promise<readonly string[]> {
  if (!ownerId || dirty.has(ownerId)) return readLivingSkyFeaturedIds(ownerId);
  if (hydrated.has(ownerId)) return readLivingSkyFeaturedIds(ownerId);
  try {
    const raw = await AsyncStorage.getItem(storageKey(ownerId));
    if (!dirty.has(ownerId)) {
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      memory.set(ownerId, sanitizeLivingSkyFeaturedIds(Array.isArray(parsed) ? parsed : []));
    }
  } catch {
    if (!dirty.has(ownerId) && !memory.has(ownerId)) memory.set(ownerId, []);
  }
  hydrated.add(ownerId);
  emit();
  return readLivingSkyFeaturedIds(ownerId);
}

async function persist(ownerId: string, ids: readonly string[]): Promise<void> {
  hydrated.add(ownerId);
  try {
    await AsyncStorage.setItem(storageKey(ownerId), JSON.stringify(ids));
  } catch {
    /* draft stays in memory for this session */
  }
}

export function toggleLivingSkyFeaturedId(ownerId: string, postId: string): LivingSkyFeaturedToggle {
  const result = applyLivingSkyFeaturedToggle(readLivingSkyFeaturedIds(ownerId), postId);
  if (!result.changed) return result;
  dirty.add(ownerId);
  memory.set(ownerId, result.ids);
  emit();
  void persist(ownerId, result.ids);
  return result;
}

export function clearLivingSkyFeaturedIds(ownerId: string): void {
  dirty.add(ownerId);
  memory.set(ownerId, []);
  emit();
  void persist(ownerId, []);
}

const EMPTY_IDS: readonly string[] = [];
let draftNoticeShown = false;

export function consumeLivingSkyFeaturedDraftNotice(): boolean {
  if (draftNoticeShown) return false;
  draftNoticeShown = true;
  return true;
}

export function useLivingSkyFeaturedIds(
  ownerId: string | null | undefined,
  enabled: boolean,
): readonly string[] {
  const [ids, setIds] = useState<readonly string[]>(EMPTY_IDS);

  useEffect(() => {
    if (!enabled || !ownerId) {
      setIds(EMPTY_IDS);
      return;
    }
    let active = true;
    const apply = () => {
      if (active) setIds(readLivingSkyFeaturedIds(ownerId));
    };
    apply();
    void hydrateLivingSkyFeaturedIds(ownerId).then(apply);
    const unsubscribe = subscribeLivingSkyFeaturedIds(apply);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled, ownerId]);

  return enabled && ownerId ? ids : EMPTY_IDS;
}
