import { buildSkywriteRecord } from '@/skywrite/draft';
import type { SkywriteDraft, SkywriteRecord } from '@/skywrite/types';

export type PublishSkywritePhase = 'saving';

export type PublishSkywriteProgress = {
  phase: PublishSkywritePhase;
  elapsedMs: number;
};

export type PublishSkywriteResult =
  | { ok: true; record: SkywriteRecord; saveMs: number }
  | { ok: false; errorMessage: string; saveMs: number };

/** Persists the post immediately — video thumbnails are generated afterward (non-blocking). */
export type PublishSkywriteOptions = {
  existingId?: string;
  createdAt?: string;
};

export async function publishSkywriteDraft(
  draft: SkywriteDraft,
  persist: (record: SkywriteRecord) => Promise<boolean>,
  authorId: string,
  onProgress?: (progress: PublishSkywriteProgress) => void,
  options?: PublishSkywriteOptions,
): Promise<PublishSkywriteResult> {
  const started = Date.now();
  const tick = () => onProgress?.({ phase: 'saving', elapsedMs: Date.now() - started });

  try {
    tick();
    const record = buildSkywriteRecord(
      draft,
      options?.existingId ?? `skywrite-${Date.now()}`,
      options?.createdAt ?? new Date().toISOString(),
      authorId,
    );
    tick();
    const saved = await persist(record);
    const saveMs = Date.now() - started;
    if (!saved) {
      return {
        ok: false,
        errorMessage: 'We couldn’t save your Skywrite. Check storage and try again.',
        saveMs,
      };
    }
    return { ok: true, record, saveMs };
  } catch {
    return {
      ok: false,
      errorMessage: 'Something went wrong while saving. Your draft is still here.',
      saveMs: Date.now() - started,
    };
  }
}
