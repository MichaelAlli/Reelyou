import type { GuidingLightRecord } from '@/guidingLight/types';

/** Beta placeholder — local fixture only, not AI inference. */
export const BETA_GUIDING_LIGHT_FIXTURE: GuidingLightRecord = {
  id: 'beta-confidence-theme',
  type: 'reflection',
  title: 'Keep building your confidence',
  supportingText: 'You’ve been returning to this theme lately.',
  source: 'fixture',
  relatedEntityId: null,
  reasonCode: 'growth-theme',
  createdAt: new Date().toISOString(),
};
