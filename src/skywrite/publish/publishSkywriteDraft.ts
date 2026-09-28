import { buildSkywriteRecord } from '@/skywrite/draft';
import { prepareSkywriteDraftForPublish } from '@/skywrite/publish/ensureSkywriteVideoThumbnail';
import type { SkywriteDraft, SkywriteRecord } from '@/skywrite/types';

export type PublishSkywriteResult =
  | { ok: true; record: SkywriteRecord }
  | { ok: false; errorMessage: string };

export async function publishSkywriteDraft(
  draft: SkywriteDraft,
  persist: (record: SkywriteRecord) => Promise<boolean>,
  authorId: string,
): Promise<PublishSkywriteResult> {
  try {
    const prepared = await prepareSkywriteDraftForPublish(draft);
    const record = buildSkywriteRecord(
      prepared,
      `skywrite-${Date.now()}`,
      new Date().toISOString(),
      authorId,
    );
    const saved = await persist(record);
    if (!saved) {
      return {
        ok: false,
        errorMessage: 'We couldn’t save your Skywrite. Check storage and try again.',
      };
    }
    return { ok: true, record };
  } catch {
    return {
      ok: false,
      errorMessage: 'Something went wrong while saving. Your draft is still here.',
    };
  }
}
