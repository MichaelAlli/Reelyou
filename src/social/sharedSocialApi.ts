import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

export function isSharedSocialPersistenceEnabled(): boolean {
  return isReelyouAuthConfigured();
}

export async function fetchSocialStateFromServer(): Promise<{
  followingUserIds: string[];
  followerUserIds: string[];
  blockedUserIds: string[];
} | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch('/v1/social/state', { method: 'GET' });
  if (!res?.ok) return null;
  return (await res.json()) as {
    followingUserIds: string[];
    followerUserIds: string[];
    blockedUserIds: string[];
  };
}

export async function postFollow(targetUserId: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch('/v1/social/follow', {
    method: 'POST',
    body: JSON.stringify({ userId: targetUserId }),
  });
  return Boolean(res?.ok);
}

export async function deleteFollow(targetUserId: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch(
    `/v1/social/follow/${encodeURIComponent(targetUserId)}`,
    { method: 'DELETE' },
  );
  return res?.status === 204 || res?.ok === true;
}

export async function postBlock(targetUserId: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch('/v1/social/blocks', {
    method: 'POST',
    body: JSON.stringify({ userId: targetUserId }),
  });
  return Boolean(res?.ok);
}

export async function postSkywrite(text: string): Promise<{ id: string } | null> {
  const res = await authenticatedReellyouFetch('/v1/content/skywrites', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  if (!res?.ok) return null;
  const body = (await res.json()) as { ok?: boolean; skywrite?: { id: string } };
  return body.skywrite ? { id: body.skywrite.id } : null;
}

export async function postSkywriteComment(skywriteId: string, text: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}/comments`,
    { method: 'POST', body: JSON.stringify({ text }) },
  );
  return Boolean(res?.ok);
}
