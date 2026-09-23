import { isBeaconActiveForArea } from '@/skyAreas/skyAreaPreferencesLogic';
import type { SkyAreaPreferencesRecord } from '@/skyAreas/skyAreaPreferencesTypes';
import { isBeaconIntentEligible } from '@/skywrite/skywriteIntent';
import type { SkywriteRecord } from '@/skywrite/types';

export function isRecipientEligibleForSkywriteBeacon(
  skywrite: SkywriteRecord & { authorId: string },
  recipientUserId: string,
  prefs: SkyAreaPreferencesRecord,
  blockedUserIds: readonly string[],
): boolean {
  if (skywrite.visibility !== 'public') return false;
  if (!isBeaconIntentEligible(skywrite)) return false;
  if (skywrite.authorId === recipientUserId) return false;
  if (blockedUserIds.includes(skywrite.authorId)) return false;

  const skyAreaId = skywrite.skyAreaId;
  if (!skyAreaId) return false;

  if (prefs.stillDiscovering) return false;
  if (prefs.pauseAllBeacons) return false;

  const selected = prefs.preferences.find(
    (entry) => entry.skyAreaId === skyAreaId && entry.selected,
  );
  if (!selected) return false;
  if (!isBeaconActiveForArea(prefs, skyAreaId)) return false;

  return true;
}
