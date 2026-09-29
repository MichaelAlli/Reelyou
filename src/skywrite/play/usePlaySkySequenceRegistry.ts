import { useCallback, useEffect, useState } from 'react';

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
      setRegistry(loaded);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: PlaySkySequenceRegistry) => {
    setRegistry(next);
    await savePlaySkySequenceRegistry(next);
  }, []);

  const registerPublication = useCallback(
    (record: Pick<SkywriteRecord, 'id' | 'authorId' | 'createdAt'>) => {
      void persist(registerPlaySkyPublication(registry, record));
    },
    [persist, registry],
  );

  const repost = useCallback(
    (skywriteId: string) => {
      void persist(repostIntoPlaySkySequence(registry, skywriteId));
    },
    [persist, registry],
  );

  return { registry, ready, registerPublication, repost };
}
