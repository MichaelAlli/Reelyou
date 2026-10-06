import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { repairSkywriteVideoThumbnailIfNeeded } from '@/social/repairSkywriteVideoThumbnail';
import {
  invalidateSkywriteRemoteMediaCache,
  resolveSkywriteLibraryPreviewRecord,
} from '@/social/resolveSkywriteRemoteMedia';
import {
  recordNeedsLibraryPreviewResolve,
} from '@/social/resolveSkywriteRemoteMedia';
import { skywriteNeedsPersistedVideoThumbnail } from '@/social/repairSkywriteVideoThumbnail';
import type { SkywriteRecord } from '@/skywrite/types';

export type LibraryPreviewResolveStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useResolvedSkywriteLibraryPreview(record: SkywriteRecord | null | undefined): {
  record: SkywriteRecord | null;
  status: LibraryPreviewResolveStatus;
  previewError: boolean;
  retry: () => void;
} {
  const needsRemote = recordNeedsLibraryPreviewResolve(record);
  const [displayRecord, setDisplayRecord] = useState<SkywriteRecord | null>(record ?? null);
  const [status, setStatus] = useState<LibraryPreviewResolveStatus>(
    record ? (needsRemote ? 'loading' : 'ready') : 'idle',
  );
  const [previewError, setPreviewError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const resolveGenerationRef = useRef(0);

  const retry = useCallback(() => {
    if (record) invalidateSkywriteRemoteMediaCache(record);
    setPreviewError(false);
    setRetryNonce((n) => n + 1);
  }, [record]);

  useEffect(() => {
    if (!record) {
      setDisplayRecord(null);
      setStatus('idle');
      setPreviewError(false);
      return;
    }
    const needsPipeline = recordNeedsLibraryPreviewResolve(record);
    const needsPersist =
      skywriteNeedsPersistedVideoThumbnail(record) && Boolean(record.media.video?.uri);

    if (!needsPipeline && !needsPersist) {
      setDisplayRecord(record);
      setStatus('ready');
      setPreviewError(false);
      return;
    }
    const generation = ++resolveGenerationRef.current;
    setStatus('loading');
    void resolveSkywriteLibraryPreviewRecord(record, { forceRefresh: retryNonce > 0 })
      .then(({ record: next, previewOk }) => {
        if (generation !== resolveGenerationRef.current) return;
        setDisplayRecord(next);
        setPreviewError(!previewOk);
        void repairSkywriteVideoThumbnailIfNeeded(next).then((repaired) => {
          if (generation !== resolveGenerationRef.current) return;
          const display = repaired ?? next;
          setDisplayRecord(display);
          const hasThumb = Boolean(display.media.video?.thumbnailUri);
          setStatus(previewOk || hasThumb ? 'ready' : 'error');
        });
      })
      .catch(() => {
        if (generation !== resolveGenerationRef.current) return;
        setDisplayRecord(record);
        setStatus('error');
        setPreviewError(true);
      });
    return () => {
      if (generation === resolveGenerationRef.current) {
        resolveGenerationRef.current += 1;
      }
    };
  }, [record, retryNonce]);

  const stableRecord = useMemo(() => displayRecord, [displayRecord]);

  return { record: stableRecord, status, previewError, retry };
}
