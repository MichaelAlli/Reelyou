import { createHmac } from 'node:crypto';

import { config, friendMatchConfigured } from '../config.js';
import { getUserRecord } from '../db/accountRepository.js';
import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import { normalizeEmail, normalizePhone } from './identifierNormalize.js';

export function blindIndex(value: string): string {
  if (!friendMatchConfigured()) {
    throw new Error('friend_match_not_configured');
  }
  return createHmac('sha256', config.friendMatch.pepper).update(value).digest('hex');
}

export function rebuildUserDiscoverabilityIndexes(userId: string): void {
  const db = loadAccountDatabase();
  for (const [idx, owner] of Object.entries(db.phoneIndex)) {
    if (owner === userId) delete db.phoneIndex[idx];
  }
  for (const [idx, owner] of Object.entries(db.emailIndex)) {
    if (owner === userId) delete db.emailIndex[idx];
  }

  const prefs = db.discoveryPreferences[userId];
  const user = getUserRecord(userId);
  if (!prefs || !user) return;

  if (prefs.discoverableByPhone && user.phoneE164) {
    const normalized = normalizePhone(user.phoneE164);
    if (normalized) db.phoneIndex[blindIndex(normalized)] = userId;
  }

  if (prefs.discoverableByEmail) {
    const normalized = normalizeEmail(user.emailNormalized);
    if (normalized) db.emailIndex[blindIndex(normalized)] = userId;
  }

  persistAccountDatabase();
}
