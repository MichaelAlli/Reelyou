import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import {
  emptySkyAreaPreferences,
  type SkyAreaPreferencesRecord,
  type UserSkyAreaPreference,
} from '@/skyAreas/skyAreaPreferencesTypes';

const STORAGE_KEY = '@reellyou/sky-area-preferences';

function parsePreference(raw: unknown): UserSkyAreaPreference | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<UserSkyAreaPreference>;
  if (typeof entry.skyAreaId !== 'string' || entry.skyAreaId.length === 0) return null;
  return {
    skyAreaId: entry.skyAreaId,
    selected: entry.selected === true,
    beaconEnabled: entry.beaconEnabled !== false,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
  };
}

function parseCustomArea(raw: unknown): SkyArea | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkyArea>;
  if (typeof entry.id !== 'string' || entry.id.length === 0) return null;
  if (typeof entry.label !== 'string' || entry.label.trim().length === 0) return null;
  if (entry.source !== 'custom') return null;
  const label = entry.label.trim();
  const createdAt = typeof entry.createdAt === 'number' ? entry.createdAt : Date.now();
  const normalizedLabel =
    typeof entry.normalizedLabel === 'string' && entry.normalizedLabel.length > 0
      ? entry.normalizedLabel
      : label.toLowerCase();
  const slug =
    typeof entry.slug === 'string' && entry.slug.length > 0
      ? entry.slug
      : entry.id.replace(/^custom-/, '').split('-')[0] ?? 'area';
  return {
    id: entry.id,
    label,
    normalizedLabel,
    slug,
    icon: entry.icon === 'briefcase' || entry.icon === 'creative' || entry.icon === 'leaf'
      ? entry.icon
      : 'community',
    source: 'custom',
    createdByUser: true,
    createdByUserId: typeof entry.createdByUserId === 'string' ? entry.createdByUserId : undefined,
    moderationStatus: entry.moderationStatus ?? 'active',
    sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : 900,
    active: entry.active !== false,
    createdAt,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : createdAt,
  };
}

function normalizePreferences(preferences: UserSkyAreaPreference[]): UserSkyAreaPreference[] {
  const byId = new Map<string, UserSkyAreaPreference>();
  for (const pref of preferences) {
    if (isSkyAreaCategoryId(pref.skyAreaId) || pref.skyAreaId.startsWith('custom-')) {
      byId.set(pref.skyAreaId, pref);
    }
  }
  return [...byId.values()];
}

export function parseSkyAreaPreferencesRecord(
  raw: string | null,
  userId: string,
): SkyAreaPreferencesRecord {
  if (!raw) return emptySkyAreaPreferences(userId);
  try {
    const parsed = JSON.parse(raw) as Partial<SkyAreaPreferencesRecord>;
    const preferences = Array.isArray(parsed.preferences)
      ? normalizePreferences(
          parsed.preferences.map(parsePreference).filter((entry): entry is UserSkyAreaPreference => entry !== null),
        )
      : [];
    const customAreas = Array.isArray(parsed.customAreas)
      ? parsed.customAreas.map(parseCustomArea).filter((entry): entry is SkyArea => entry !== null)
      : [];
    return {
      userId: typeof parsed.userId === 'string' ? parsed.userId : userId,
      stillDiscovering: parsed.stillDiscovering === true,
      pauseAllBeacons: parsed.pauseAllBeacons === true,
      preferences,
      customAreas,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return emptySkyAreaPreferences(userId);
  }
}

export async function loadSkyAreaPreferences(
  userId: string,
): Promise<SkyAreaPreferencesRecord> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const record = parseSkyAreaPreferencesRecord(stored, userId);
    if (record.userId !== userId) {
      return emptySkyAreaPreferences(userId);
    }
    return record;
  } catch {
    return emptySkyAreaPreferences(userId);
  }
}

export async function saveSkyAreaPreferences(record: SkyAreaPreferencesRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Non-blocking for Beta local-first UX.
  }
}

export async function clearSkyAreaPreferencesStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-blocking.
  }
}
