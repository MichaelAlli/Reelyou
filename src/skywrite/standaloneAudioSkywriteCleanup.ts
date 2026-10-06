import { deleteSkywriteOnServer } from '@/social/sharedSkywriteApi';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import {
  filterVisibleBetaSkywrites,
  isStandaloneAudioSkywrite,
  standaloneAudioSkywritesEnabled,
} from '@/skywrite/standaloneAudioSkywrite';
import type { SkywritesState } from '@/skywrite/types';
import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

const CLEANUP_MARKER_KEY = 'reelyou.beta.standaloneAudioCleanupV1';

function parseMarker(raw: string | null): { completedAt: number; removedCount: number } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { completedAt?: number; removedCount?: number };
    if (typeof parsed.completedAt !== 'number') return null;
    return {
      completedAt: parsed.completedAt,
      removedCount: typeof parsed.removedCount === 'number' ? parsed.removedCount : 0,
    };
  } catch {
    return null;
  }
}

async function loadCleanupMarker(): Promise<{ completedAt: number; removedCount: number } | null> {
  return readScopedJson(CLEANUP_MARKER_KEY, parseMarker);
}

async function saveCleanupMarker(removedCount: number): Promise<void> {
  await writeScopedJson(CLEANUP_MARKER_KEY, {
    completedAt: Date.now(),
    removedCount,
  });
}

export type StandaloneAudioCleanupResult = {
  state: SkywritesState;
  found: number;
  removed: number;
  ranCleanup: boolean;
};

/** Idempotent — removes standalone audio-only posts from local state and requests server delete. */
export async function purgeDisabledStandaloneAudioSkywrites(
  state: SkywritesState,
): Promise<StandaloneAudioCleanupResult> {
  if (standaloneAudioSkywritesEnabled()) {
    return { state, found: 0, removed: 0, ranCleanup: false };
  }

  const standalone = state.posts.filter((post) => isStandaloneAudioSkywrite(post));
  const marker = await loadCleanupMarker();
  const filtered: SkywritesState = {
    posts: filterVisibleBetaSkywrites(state.posts),
  };

  if (standalone.length === 0) {
    if (!marker) await saveCleanupMarker(0);
    return { state: filtered, found: 0, removed: 0, ranCleanup: false };
  }

  if (__DEV__) {
    console.info('[standalone-audio-cleanup]', {
      found: standalone.length,
      ids: standalone.map((p) => p.id),
    });
  }

  if (isSharedSocialPersistenceEnabled()) {
    for (const post of standalone) {
      void deleteSkywriteOnServer(post.id);
    }
  }

  await saveCleanupMarker(standalone.length);

  return {
    state: filtered,
    found: standalone.length,
    removed: standalone.length,
    ranCleanup: true,
  };
}
