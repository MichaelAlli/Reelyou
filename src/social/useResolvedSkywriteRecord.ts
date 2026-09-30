import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  invalidateSkywriteRemoteMediaCache,
  resolveSkywriteRecord,
} from '@/social/resolveSkywriteRemoteMedia';
import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import type { SkywriteRecord } from '@/skywrite/types';

export type RemoteMediaResolveStatus = 'idle' | 'loading' | 'ready' | 'error';

function recordNeedsRemoteResolve(record: SkywriteRecord | null | undefined): boolean {
  if (!record) return false;
  const parts = [
    record.media.photo?.uri,
    record.media.video?.uri,
    record.media.video?.thumbnailUri,
    record.media.audio?.uri,
  ];
  return parts.some((uri) => Boolean(parseRemoteAssetIdFromUri(uri)));
}

export function useResolvedSkywriteRecord(record: SkywriteRecord | null | undefined): {
  record: SkywriteRecord | null;
  status: RemoteMediaResolveStatus;
  mediaError: boolean;
  retry: () => void;
} {
  const needsRemote = recordNeedsRemoteResolve(record);
  const [displayRecord, setDisplayRecord] = useState<SkywriteRecord | null>(record ?? null);
  const [status, setStatus] = useState<RemoteMediaResolveStatus>(
    record ? (needsRemote ? 'loading' : 'ready') : 'idle',
  );
  const [mediaError, setMediaError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const retry = useCallback(() => {
    if (record) invalidateSkywriteRemoteMediaCache(record);
    setMediaError(false);
    setRetryNonce((n) => n + 1);
  }, [record]);

  useEffect(() => {
    if (!record) {
      setDisplayRecord(null);
      setStatus('idle');
      setMediaError(false);
      return;
    }
    if (!recordNeedsRemoteResolve(record)) {
      setDisplayRecord(record);
      setStatus('ready');
      setMediaError(false);
      return;
    }
    let mounted = true;
    setStatus('loading');
    void resolveSkywriteRecord(record, { forceRefresh: retryNonce > 0 }).then(({ record: next, allOk }) => {
      if (!mounted) return;
      setDisplayRecord(next);
      setStatus(allOk ? 'ready' : 'error');
      setMediaError(!allOk);
    });
    return () => {
      mounted = false;
    };
  }, [record, retryNonce]);

  const stableRecord = useMemo(() => displayRecord, [displayRecord]);

  return { record: stableRecord, status, mediaError, retry };
}
