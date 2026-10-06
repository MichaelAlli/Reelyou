import { useCallback, useEffect, useState } from 'react';

import {
  loadMySkyStarIntroState,
  markMySkyStarIntroSeen,
  markSkywriteStarIntroSeen,
  type MySkyStarIntroState,
} from '@/mySky/mySkyStarIntroPersistence';

export function useMySkyStarIntro() {
  const [state, setState] = useState<MySkyStarIntroState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadMySkyStarIntroState().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const dismissSkywriteIntro = useCallback(async () => {
    const next = await markSkywriteStarIntroSeen();
    setState(next);
  }, []);

  const dismissMySkyIntro = useCallback(async () => {
    const next = await markMySkyStarIntroSeen();
    setState(next);
  }, []);

  const showSkywriteIntro = ready && state !== null && !state.hasSeenSkywriteStarIntro;
  const showMySkyIntro = ready && state !== null && !state.hasSeenMySkyStarIntro;
  const identityStarIntroPulse = showMySkyIntro;

  return {
    ready,
    showSkywriteIntro,
    showMySkyIntro,
    identityStarIntroPulse,
    dismissSkywriteIntro,
    dismissMySkyIntro,
  };
}
