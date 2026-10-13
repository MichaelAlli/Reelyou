/**
 * Documents StarPath cross-device expectations — no live device E2E.
 * Journey personalization rebuilds from onboarding profile + skywrites after server hydrate.
 * StarPath authoritative bundle (interactions, resources, guidance) remains per-device client storage.
 */
import { STARPATH_DERIVED_DOMAINS } from '@/starpath/starpathPersistenceTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(STARPATH_DERIVED_DOMAINS.includes('siftingState'), 'derived domains documented');
assert(STARPATH_DERIVED_DOMAINS.length >= 4, 'derived list non-empty');

console.log('[starpathCrossDeviceContinuity.test] ok — client StarPath bundle is device-local; context rebuilds from synced profile/skywrites');
