import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';

const STORAGE_KEY = '@reellyou/play-sky-sequence-registry';

function parseEntry(raw: unknown): PlaySkySequenceRegistry[string] | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<PlaySkySequenceRegistry[string]>;
  if (typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.ownerId !== 'string') return null;
  if (typeof entry.publishedAt !== 'string') return null;
  if (typeof entry.activeUntilMs !== 'number') return null;
  return {
    skywriteId: entry.skywriteId,
    ownerId: entry.ownerId,
    publishedAt: entry.publishedAt,
    activeUntilMs: entry.activeUntilMs,
    repostedAtMs: typeof entry.repostedAtMs === 'number' ? entry.repostedAtMs : undefined,
  };
}

export function parsePlaySkySequenceRegistry(raw: string | null): PlaySkySequenceRegistry {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: PlaySkySequenceRegistry = {};
    for (const [key, value] of Object.entries(parsed)) {
      const entry = parseEntry(value);
      if (entry) out[key] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

export async function loadPlaySkySequenceRegistry(): Promise<PlaySkySequenceRegistry> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parsePlaySkySequenceRegistry(raw);
  } catch {
    return {};
  }
}

export async function savePlaySkySequenceRegistry(registry: PlaySkySequenceRegistry): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
}
