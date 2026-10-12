import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import type { PersonalJourneySettings } from '@/journey/personalJourneyPersistence';

export async function fetchMyPersonalJourneyFromServer(): Promise<PersonalJourneySettings | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch('/v1/journey/me', { method: 'GET' });
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    journey?: PersonalJourneySettings;
  };
  if (!body.journey) return null;
  return body.journey;
}

export async function patchMyPersonalJourneyOnServer(patch: {
  customTitle?: string | null;
  orderedSkywriteIds?: string[];
}): Promise<PersonalJourneySettings | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch('/v1/journey/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    journey?: PersonalJourneySettings;
  };
  return body.journey ?? null;
}

export async function fetchUserPersonalJourneyFromServer(
  ownerUserId: string,
): Promise<PersonalJourneySettings | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch(
    `/v1/journey/users/${encodeURIComponent(ownerUserId)}`,
    { method: 'GET' },
  );
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    journey?: PersonalJourneySettings;
  };
  return body.journey ?? null;
}
