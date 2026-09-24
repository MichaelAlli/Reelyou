import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { normalizeSkyAreaLabel } from '@/skyAreas/skyAreaNormalization';

const STORAGE_KEY = '@reellyou/sky-area-shared-catalog';

export async function loadSharedSkyAreas(): Promise<SkyArea[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is SkyArea => {
      return (
        entry &&
        typeof entry === 'object' &&
        typeof (entry as SkyArea).id === 'string' &&
        typeof (entry as SkyArea).label === 'string' &&
        (entry as SkyArea).source === 'custom'
      );
    });
  } catch {
    return [];
  }
}

export async function saveSharedSkyAreas(areas: readonly SkyArea[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
  } catch {
    // Non-blocking.
  }
}

export function findSharedAreaByLabel(
  areas: readonly SkyArea[],
  label: string,
): SkyArea | undefined {
  const norm = normalizeSkyAreaLabel(label);
  return areas.find((area) => normalizeSkyAreaLabel(area.label) === norm);
}

export async function registerSharedSkyArea(area: SkyArea): Promise<SkyArea[]> {
  const existing = await loadSharedSkyAreas();
  const found = findSharedAreaByLabel(existing, area.label);
  if (found) return existing;
  const next = [...existing, area];
  await saveSharedSkyAreas(next);
  return next;
}
