import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import { isReelyouServerAuthEnabled } from '@/config/betaReleaseFlags';

export function isReelyouAuthConfigured(): boolean {
  return isReelyouServerAuthEnabled() && isReellyouBackendConfigured();
}

export function resolveAuthApiBaseUrl(): string | null {
  if (!isReelyouAuthConfigured()) return null;
  return resolveReellyouApiBaseUrl();
}
