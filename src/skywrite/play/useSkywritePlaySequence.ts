import { useCallback, useEffect, useState } from 'react';

import type { SkywritePlaySequenceState } from '@/skywrite/play/skywritePlayTypes';
import { EMPTY_SKYWRITE_PLAY_SEQUENCE } from '@/skywrite/play/skywritePlayTypes';
import {
  loadSkywritePlaySequence,
  saveSkywritePlaySequence,
} from '@/skywrite/play/skywritePlayPersistence';

export function useSkywritePlaySequence() {
  const [state, setState] = useState<SkywritePlaySequenceState>(EMPTY_SKYWRITE_PLAY_SEQUENCE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSkywritePlaySequence().then((loaded) => {
      if (mounted) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: SkywritePlaySequenceState) => {
    setState(next);
    await saveSkywritePlaySequence(next);
  }, []);

  const updateFocusedConfig = useCallback(
    (patch: Partial<SkywritePlaySequenceState['focusedSky']>) => {
      void persist({
        ...state,
        focusedSky: { ...state.focusedSky, ...patch },
        updatedAt: Date.now(),
      });
    },
    [persist, state],
  );

  return {
    ready,
    state,
    updateFocusedConfig,
    persist,
  };
}
