import type { SkywriteRecord } from '@/skywrite/types';

/**
 * Post-save side effects — intentionally separate from the publish transaction.
 * AI interpretation must never block persistence; beta has no live AI pipeline here.
 */
export function scheduleSkywritePostPublishEffects(_record: SkywriteRecord): void {
  void Promise.resolve().then(() => {
    // Reserved: permitted async analysis when an external service is configured.
  });
}
