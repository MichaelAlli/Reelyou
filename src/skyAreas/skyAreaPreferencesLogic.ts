import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { buildCustomSkyArea } from '@/skyAreas/skyAreaDefinition';
import type {
  SkyAreaPreferencesRecord,
  UserSkyAreaPreference,
} from '@/skyAreas/skyAreaPreferencesTypes';

function nowMs(): number {
  return Date.now();
}

export function getPreference(
  record: SkyAreaPreferencesRecord,
  skyAreaId: string,
): UserSkyAreaPreference | undefined {
  return record.preferences.find((entry) => entry.skyAreaId === skyAreaId);
}

export function isSkyAreaSelected(record: SkyAreaPreferencesRecord, skyAreaId: string): boolean {
  return getPreference(record, skyAreaId)?.selected === true;
}

export function selectedSkyAreaIds(record: SkyAreaPreferencesRecord): string[] {
  return record.preferences.filter((entry) => entry.selected).map((entry) => entry.skyAreaId);
}

export function isBeaconActiveForArea(record: SkyAreaPreferencesRecord, skyAreaId: string): boolean {
  if (record.pauseAllBeacons) return false;
  const pref = getPreference(record, skyAreaId);
  return pref?.selected === true && pref.beaconEnabled === true;
}

function upsertPreference(
  preferences: UserSkyAreaPreference[],
  skyAreaId: string,
  patch: Partial<UserSkyAreaPreference>,
): UserSkyAreaPreference[] {
  const ts = nowMs();
  const existing = preferences.find((entry) => entry.skyAreaId === skyAreaId);
  if (!existing) {
    const created: UserSkyAreaPreference = {
      skyAreaId,
      selected: patch.selected ?? false,
      beaconEnabled: patch.beaconEnabled ?? true,
      createdAt: ts,
      updatedAt: ts,
    };
    return [...preferences, created];
  }
  return preferences.map((entry) =>
    entry.skyAreaId === skyAreaId
      ? {
          ...entry,
          ...patch,
          updatedAt: ts,
        }
      : entry,
  );
}

export function toggleSkyAreaSelection(
  record: SkyAreaPreferencesRecord,
  skyAreaId: string,
): SkyAreaPreferencesRecord {
  const existing = getPreference(record, skyAreaId);
  const nextSelected = !(existing?.selected === true);
  const ts = nowMs();
  return {
    ...record,
    stillDiscovering: nextSelected ? false : record.stillDiscovering,
    preferences: upsertPreference(record.preferences, skyAreaId, {
      selected: nextSelected,
      beaconEnabled: nextSelected ? (existing?.beaconEnabled ?? true) : (existing?.beaconEnabled ?? true),
    }),
    updatedAt: ts,
  };
}

export function setSkyAreaBeaconEnabled(
  record: SkyAreaPreferencesRecord,
  skyAreaId: string,
  enabled: boolean,
): SkyAreaPreferencesRecord {
  const existing = getPreference(record, skyAreaId);
  if (!existing?.selected) {
    return record;
  }
  return {
    ...record,
    preferences: upsertPreference(record.preferences, skyAreaId, { beaconEnabled: enabled }),
    updatedAt: nowMs(),
  };
}

export function setPauseAllContributionBeacons(
  record: SkyAreaPreferencesRecord,
  paused: boolean,
): SkyAreaPreferencesRecord {
  return {
    ...record,
    pauseAllBeacons: paused,
    updatedAt: nowMs(),
  };
}

export function setStillDiscovering(
  record: SkyAreaPreferencesRecord,
  discovering: boolean,
): SkyAreaPreferencesRecord {
  const ts = nowMs();
  if (!discovering) {
    return { ...record, stillDiscovering: false, updatedAt: ts };
  }
  return {
    ...record,
    stillDiscovering: true,
    preferences: record.preferences.map((entry) =>
      entry.selected
        ? { ...entry, selected: false, updatedAt: ts }
        : entry,
    ),
    updatedAt: ts,
  };
}

export function addCustomSkyArea(
  record: SkyAreaPreferencesRecord,
  label: string,
): { record: SkyAreaPreferencesRecord; area: SkyArea | null; error?: string } {
  const trimmed = label.trim();
  if (trimmed.length < 2) {
    return { record, area: null, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 48) {
    return { record, area: null, error: 'Keep the name under 48 characters.' };
  }
  const duplicate = record.customAreas.some(
    (area) => area.label.localeCompare(trimmed, undefined, { sensitivity: 'accent' }) === 0,
  );
  if (duplicate) {
    return { record, area: null, error: 'You already have an area with this name.' };
  }
  const area = buildCustomSkyArea(trimmed);
  const ts = nowMs();
  const next: SkyAreaPreferencesRecord = {
    ...record,
    stillDiscovering: false,
    customAreas: [...record.customAreas, area],
    preferences: upsertPreference(record.preferences, area.id, {
      selected: true,
      beaconEnabled: true,
    }),
    updatedAt: ts,
  };
  return { record: next, area };
}

export function filterCatalogByQuery(areas: readonly SkyArea[], query: string): SkyArea[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...areas];
  return areas.filter((area) => area.label.toLowerCase().includes(q));
}
