import {
  clearImportedDiscoveryData,
  getDiscoveryPreferences,
  updateDiscoveryPreferences,
} from '../db/accountRepository.js';

export function handleGetDiscoverySettings(userId: string) {
  return getDiscoveryPreferences(userId);
}

export function handlePatchDiscoverySettings(
  userId: string,
  body: { discoverableByPhone?: boolean; discoverableByEmail?: boolean },
) {
  return updateDiscoveryPreferences(userId, body);
}

export function handleDeleteImportedDiscoveryData(userId: string): void {
  clearImportedDiscoveryData(userId);
}
