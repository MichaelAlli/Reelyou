import { useCallback } from 'react';

import { useOnboarding } from '@/onboarding';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import type { SkywriteRecord } from '@/skywrite/types';

/**
 * Content deletion: tombstone + strip local post body/media.
 * Human-potential evidence stores are unchanged.
 */
export function useApplySkywriteContentDeletion() {
  const { deleteSkywriteContent } = useSkywriteLibrary();
  const { stripSkywriteContentForDeletion } = useOnboarding();

  return useCallback(
    (post: SkywriteRecord & { authorId: string }) => {
      deleteSkywriteContent(post);
      stripSkywriteContentForDeletion(post.id);
    },
    [deleteSkywriteContent, stripSkywriteContentForDeletion],
  );
}
