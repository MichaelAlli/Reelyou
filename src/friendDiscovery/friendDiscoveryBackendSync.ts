import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isProductionFriendDiscoveryReady } from '@/config/betaReleaseFlags';

export async function fetchServerDiscoverySettings(): Promise<{
  discoverableByPhone: boolean;
  discoverableByEmail: boolean;
  updatedAt: number;
} | null> {
  if (!isProductionFriendDiscoveryReady()) return null;
  const res = await authenticatedReellyouFetch('/v1/friends/discovery-settings', { method: 'GET' });
  if (!res?.ok) return null;
  return (await res.json()) as {
    discoverableByPhone: boolean;
    discoverableByEmail: boolean;
    updatedAt: number;
  };
}

export async function patchServerDiscoverySettings(patch: {
  discoverableByPhone?: boolean;
  discoverableByEmail?: boolean;
}): Promise<boolean> {
  if (!isProductionFriendDiscoveryReady()) return false;
  const res = await authenticatedReellyouFetch('/v1/friends/discovery-settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return Boolean(res?.ok);
}

export async function deleteServerImportedDiscoveryData(): Promise<boolean> {
  if (!isProductionFriendDiscoveryReady()) return false;
  const res = await authenticatedReellyouFetch('/v1/friends/imported-discovery-data', {
    method: 'DELETE',
  });
  return res?.status === 204;
}
