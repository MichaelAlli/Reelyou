import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  if (parts.some((uri) => Boolean(parseRemoteAssetIdFromUri(uri)))) return true;
  return (
    Boolean(record.media.photo?.remoteAssetId) ||
    Boolean(record.media.video?.remoteAssetId) ||
    Boolean(record.media.audio?.remoteAssetId)
  );
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
  const resolveGenerationRef = useRef(0);

  const retry = useCallback(() => {
    if (record) invalidateSkywriteRemoteMediaCache(record);
    setMediaError(false);
    setRetryNonce((n) => n + 1);
  }, [record]);

  const recordId = record?.id ?? null;
  const recordResolveKey = record
    ? `${record.id}:${record.mediaMode}:${record.media.photo?.remoteAssetId ?? record.media.photo?.uri ?? ''}:${record.media.video?.remoteAssetId ?? record.media.video?.uri ?? ''}:${record.media.audio?.remoteAssetId ?? record.media.audio?.uri ?? ''}`
    : null;

  useEffect(() => {
    if (!record || !recordResolveKey) {
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
    const generation = ++resolveGenerationRef.current;
    setStatus('loading');
    void resolveSkywriteRecord(record, { forceRefresh: retryNonce > 0 })
      .then(({ record: next, allOk }) => {
        if (generation !== resolveGenerationRef.current) return;
        setDisplayRecord(next);
        setStatus(allOk ? 'ready' : 'error');
        setMediaError(!allOk);
      })
      .catch(() => {
        if (generation !== resolveGenerationRef.current) return;
        setDisplayRecord(record);
        setStatus('error');
        setMediaError(true);
      });
    return () => {
      if (generation === resolveGenerationRef.current) {
        resolveGenerationRef.current += 1;
      }
    };
  }, [record, recordId, recordResolveKey, retryNonce]);

  const stableRecord = useMemo(() => displayRecord, [displayRecord]);

  return { record: stableRecord, status, mediaError, retry };
}
