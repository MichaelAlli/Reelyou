import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FocusedSkyPin, FocusedSkyPinObjectType } from '@/sharedSky/sharedSkyTypes';

const STORAGE_KEY = '@reellyou/focused-sky-pins';

export async function loadFocusedSkyPins(): Promise<FocusedSkyPin[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FocusedSkyPin[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFocusedSkyPins(pins: FocusedSkyPin[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

export function sortPins(pins: FocusedSkyPin[]): FocusedSkyPin[] {
  return [...pins].sort((a, b) => a.userOrder - b.userOrder || b.pinnedAt.localeCompare(a.pinnedAt));
}

export function upsertPin(
  pins: FocusedSkyPin[],
  objectId: string,
  objectType: FocusedSkyPinObjectType,
): FocusedSkyPin[] {
  const existing = pins.find((pin) => pin.objectId === objectId && pin.objectType === objectType);
  if (existing) return pins;
  const nextOrder = pins.length > 0 ? Math.min(...pins.map((pin) => pin.userOrder)) - 1 : 0;
  return sortPins([
    ...pins,
    {
      objectId,
      objectType,
      pinnedAt: new Date().toISOString(),
      userOrder: nextOrder,
    },
  ]);
}

export function removePin(
  pins: FocusedSkyPin[],
  objectId: string,
  objectType: FocusedSkyPinObjectType,
): FocusedSkyPin[] {
  return pins.filter((pin) => !(pin.objectId === objectId && pin.objectType === objectType));
}
