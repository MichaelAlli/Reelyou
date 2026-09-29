import { registerPlaySkyPublication } from '@/skywrite/play/playSkySequenceEligibility';
import {
  loadPlaySkySequenceRegistry,
  savePlaySkySequenceRegistry,
} from '@/skywrite/play/playSkySequencePersistence';
import type { SkywriteRecord } from '@/skywrite/types';

/**
 * Post-save side effects — intentionally separate from the publish transaction.
 * AI interpretation must never block persistence; beta has no live AI pipeline here.
 */
export function scheduleSkywritePostPublishEffects(record: SkywriteRecord): void {
  void Promise.resolve().then(async () => {
    const registry = await loadPlaySkySequenceRegistry();
    await savePlaySkySequenceRegistry(registerPlaySkyPublication(registry, record));
  });
}
