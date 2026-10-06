import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';

export interface SkyreelViewerRow {
  userId: string;
  displayName: string;
  lastViewedAt: number;
}

export async function recordSkyreelViewOnServer(skywriteId: string): Promise<boolean> {
  if (!isSharedSocialPersistenceEnabled()) return false;
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}/skyreel/view`,
    { method: 'POST' },
  );
  return Boolean(res?.ok);
}

export async function fetchSkyreelViewersForOwner(
  skywriteId: string,
): Promise<{ count: number; viewers: SkyreelViewerRow[] } | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}/skyreel/viewers`,
    { method: 'GET' },
  );
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    count?: number;
    viewers?: SkyreelViewerRow[];
  };
  if (!body.ok) return null;
  return { count: body.count ?? 0, viewers: body.viewers ?? [] };
}
