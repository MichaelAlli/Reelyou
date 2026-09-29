import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  SKY_AREA_CATEGORIES,
  isSkyAreaCategoryId,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';

const STORAGE_KEY = '@reellyou/profile-sky-area-shortcuts';

export const PROFILE_SKY_AREA_SHORTCUT_COUNT = 3;

function normalizeIds(raw: unknown): SkyAreaCategoryId[] {
  if (!Array.isArray(raw)) return [...PROFILE_BETA_PREVIEW_CATEGORY_IDS];
  const seen = new Set<string>();
  const ids: SkyAreaCategoryId[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string' || !isSkyAreaCategoryId(entry) || seen.has(entry)) continue;
    seen.add(entry);
    ids.push(entry);
  }
  if (ids.length < PROFILE_SKY_AREA_SHORTCUT_COUNT) {
    for (const category of SKY_AREA_CATEGORIES) {
      if (ids.length >= PROFILE_SKY_AREA_SHORTCUT_COUNT) break;
      if (!seen.has(category.id)) {
        seen.add(category.id);
        ids.push(category.id);
      }
    }
  }
  return ids.slice(0, PROFILE_SKY_AREA_SHORTCUT_COUNT);
}

export async function loadProfileSkyAreaShortcutIds(): Promise<SkyAreaCategoryId[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [...PROFILE_BETA_PREVIEW_CATEGORY_IDS];
    return normalizeIds(JSON.parse(stored));
  } catch {
    return [...PROFILE_BETA_PREVIEW_CATEGORY_IDS];
  }
}

export async function saveProfileSkyAreaShortcutIds(
  ids: readonly SkyAreaCategoryId[],
): Promise<void> {
  const normalized = normalizeIds([...ids]);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
