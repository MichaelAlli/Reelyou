import { RESOURCE_PROVIDER_ADAPTERS } from '@/starpath/starpathResourceProviderTypes';
import { fetchBackendResourceCandidates } from '@/starpath/providers/backendResourceAdapter';
import { isReellyouBackendConfigured } from '@/backend/reellyouApiConfig';

let registered = false;

/** Idempotent — registers live backend adapter when API URL is configured. */
export function registerStarpathBackendProviders(): void {
  if (registered || !isReellyouBackendConfigured()) return;
  registered = true;
  RESOURCE_PROVIDER_ADAPTERS.push({
    providerKey: 'partner_plugin',
    fetchCandidates: fetchBackendResourceCandidates,
  });
}
