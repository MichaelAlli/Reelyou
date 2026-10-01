import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

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

function migratePlayRegistryForUser(
  registry: PlaySkySequenceRegistry,
  userId: string,
): PlaySkySequenceRegistry {
  const out: PlaySkySequenceRegistry = {};
  for (const [id, entry] of Object.entries(registry)) {
    if (entry.ownerId === userId) out[id] = entry;
  }
  return out;
}

export async function loadPlaySkySequenceRegistry(): Promise<PlaySkySequenceRegistry> {
  try {
    return await readScopedJson(
      STORAGE_KEY,
      parsePlaySkySequenceRegistry,
      migratePlayRegistryForUser,
    );
  } catch {
    return {};
  }
}

export async function savePlaySkySequenceRegistry(registry: PlaySkySequenceRegistry): Promise<void> {
  await writeScopedJson(STORAGE_KEY, registry);
}
