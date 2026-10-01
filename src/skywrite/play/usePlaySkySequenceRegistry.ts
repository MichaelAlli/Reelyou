import { useCallback, useEffect, useState } from 'react';

import { mergeExploreDemoPlaySkyRegistry } from '@/explore/exploreDemoSkies';
import { repostSkyreelOnServer } from '@/social/sharedSkywriteApi';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { mergeServerSkyreelIntoRegistry } from '@/skywrite/play/mergeServerSkyreelRegistry';
import type { SkywriteRecord } from '@/skywrite/types';
import {
  registerPlaySkyPublication,
  repostIntoPlaySkySequence,
  type PlaySkySequenceRegistry,
} from '@/skywrite/play/playSkySequenceEligibility';
import {
  loadPlaySkySequenceRegistry,
  savePlaySkySequenceRegistry,
} from '@/skywrite/play/playSkySequencePersistence';

export function usePlaySkySequenceRegistry() {
  const [registry, setRegistry] = useState<PlaySkySequenceRegistry>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadPlaySkySequenceRegistry().then((loaded) => {
      if (!mounted) return;
      setRegistry(mergeExploreDemoPlaySkyRegistry(loaded));
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: PlaySkySequenceRegistry) => {
    const merged = mergeExploreDemoPlaySkyRegistry(next);
    setRegistry(merged);
    await savePlaySkySequenceRegistry(merged);
    return merged;
  }, []);

  const registerPublication = useCallback(
    (record: Pick<SkywriteRecord, 'id' | 'authorId' | 'createdAt'>) => {
      void persist(registerPlaySkyPublication(registry, record));
    },
    [persist, registry],
  );

  const repostToSkyreel = useCallback(
    async (
      skywriteId: string,
      record?: Pick<SkywriteRecord, 'id' | 'authorId' | 'createdAt'>,
    ): Promise<{ ok: boolean }> => {
      let next = registry;
      if (record && !next[skywriteId]) {
        next = registerPlaySkyPublication(next, record);
      }

      let serverRow: Awaited<ReturnType<typeof repostSkyreelOnServer>> = null;
      if (isSharedSocialPersistenceEnabled()) {
        serverRow = await repostSkyreelOnServer(skywriteId);
        if (!serverRow) return { ok: false };
        next = mergeServerSkyreelIntoRegistry(next, [serverRow]);
      } else {
        const nowMs = Date.now();
        next = repostIntoPlaySkySequence(next, skywriteId, nowMs);
      }

      await persist(next);
      return { ok: true };
    },
    [persist, registry],
  );

  /** @deprecated Use repostToSkyreel */
  const repost = useCallback(
    (skywriteId: string) => {
      void repostToSkyreel(skywriteId);
    },
    [repostToSkyreel],
  );

  const mergeServerRows = useCallback(
    async (rows: Parameters<typeof mergeServerSkyreelIntoRegistry>[1]) => {
      await persist(mergeServerSkyreelIntoRegistry(registry, rows));
    },
    [persist, registry],
  );

  return { registry, ready, registerPublication, repost, repostToSkyreel, mergeServerRows };
}
