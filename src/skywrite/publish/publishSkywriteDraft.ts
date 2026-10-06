import { buildSkywriteRecord } from '@/skywrite/draft';
import { validateSkywriteDraftForBeta } from '@/skywrite/standaloneAudioSkywrite';
import type { SkywriteDraft, SkywriteRecord } from '@/skywrite/types';

export type PublishSkywritePhase =
  | 'preparing_media'
  | 'uploading_media'
  | 'finalizing'
  | 'posting';

export type PublishSkywriteProgress = {
  phase: PublishSkywritePhase;
  elapsedMs: number;
};

export type PublishStageTimingMs = {
  preparingMs?: number;
  uploadSessionMs?: number;
  uploadTransferMs?: number;
  finalizeAssetsMs?: number;
  createPostMs?: number;
  libraryReconcileMs?: number;
};

export type PublishTimingMs = {
  totalMs: number;
  uploadMs?: number;
  serverMs?: number;
  stages?: PublishStageTimingMs;
};

export type PublishSkywriteResult =
  | { ok: true; record: SkywriteRecord; saveMs: number; timing?: PublishTimingMs }
  | { ok: false; errorMessage: string; saveMs: number };

/** Persists the post immediately — video thumbnails are generated afterward (non-blocking). */
export type PublishSkywriteOptions = {
  existingId?: string;
  createdAt?: string;
};

export async function publishSkywriteDraft(
  draft: SkywriteDraft,
  persist: (record: SkywriteRecord) => Promise<SkywriteRecord | false>,
  authorId: string,
  onProgress?: (progress: PublishSkywriteProgress) => void,
  options?: PublishSkywriteOptions,
): Promise<PublishSkywriteResult> {
  const started = Date.now();
  const tick = (phase: PublishSkywritePhase = 'posting') =>
    onProgress?.({ phase, elapsedMs: Date.now() - started });

  try {
    tick('preparing_media');
    const betaError = validateSkywriteDraftForBeta(draft);
    if (betaError) {
      return { ok: false, errorMessage: betaError, saveMs: Date.now() - started };
    }
    const record = buildSkywriteRecord(
      draft,
      options?.existingId ?? `skywrite-${Date.now()}`,
      options?.createdAt ?? new Date().toISOString(),
      authorId,
    );
    tick('posting');
    const persisted = await persist(record);
    const saveMs = Date.now() - started;
    if (!persisted) {
      return {
        ok: false,
        errorMessage: 'We couldn’t post your Skywrite. Your draft is still here.',
        saveMs,
      };
    }
    return { ok: true, record: persisted, saveMs };
  } catch {
    return {
      ok: false,
      errorMessage: 'Something went wrong while posting. Your draft is still here.',
      saveMs: Date.now() - started,
    };
  }
}
