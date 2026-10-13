import { createHash } from 'node:crypto';

import type { StoredSkywrite } from '../social/skywriteTypes.js';

export function hashEligibleSkywritesForSignals(posts: readonly StoredSkywrite[]): string {
  const payload = posts.map((p) => ({
    id: p.id,
    createdAt: p.createdAt,
    text: (p.text ?? '').trim().slice(0, 2000),
  }));
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
