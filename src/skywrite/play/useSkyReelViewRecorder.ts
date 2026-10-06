import { useEffect, useRef } from 'react';

import { recordSkyreelViewOnServer } from '@/social/skyreelViewsApi';

/** One view per skywrite per session when the story segment becomes active. */
export function useSkyReelViewRecorder(input: {
  skywriteId: string | undefined;
  active: boolean;
  isOwner: boolean;
  enabled: boolean;
}): void {
  const recordedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!input.enabled || !input.active || !input.skywriteId || input.isOwner) return;
    if (recordedRef.current.has(input.skywriteId)) return;
    recordedRef.current.add(input.skywriteId);
    void recordSkyreelViewOnServer(input.skywriteId);
  }, [input.active, input.enabled, input.isOwner, input.skywriteId]);
}
