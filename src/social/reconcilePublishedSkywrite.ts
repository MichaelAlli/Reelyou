import { fetchSkywriteFromServer } from '@/social/sharedSkywriteApi';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import type { SkywriteRecord } from '@/skywrite/types';

/** After timeout/ambiguous failure, recover authoritative post by client id (idempotent create). */
export async function reconcilePublishedSkywriteById(
  skywriteId: string,
): Promise<SkywriteRecord | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  return fetchSkywriteFromServer(skywriteId);
}
