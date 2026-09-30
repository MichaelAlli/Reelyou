import { useEffect, useState } from 'react';

import { resolveSkywriteRecord } from '@/social/resolveSkywriteRemoteMedia';
import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import type { SkywriteRecord } from '@/skywrite/types';

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

export function useResolvedSkywriteRecord(
  record: SkywriteRecord | null | undefined,
): SkywriteRecord | null {
  const [resolved, setResolved] = useState<SkywriteRecord | null>(record ?? null);

  useEffect(() => {
    if (!record) {
      setResolved(null);
      return;
    }
    if (!recordNeedsRemoteResolve(record)) {
      setResolved(record);
      return;
    }
    let mounted = true;
    void resolveSkywriteRecord(record).then((next) => {
      if (mounted) setResolved(next);
    });
    return () => {
      mounted = false;
    };
  }, [record]);

  return resolved;
}
