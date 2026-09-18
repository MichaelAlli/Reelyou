import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_SKY_EVOLUTION,
  type SkyEvolutionEntry,
  type SkyEvolutionRecord,
} from '@/mySky/skyEvolution';
import { SKY_GROWTH_EVENT_TYPES, type SkyGrowthEventType } from '@/mySky/skyNodeTypes';

const STORAGE_KEY = '@reellyou/my-sky-evolution';
const MAX_ENTRIES = 120;

const EVENT_TYPES = new Set<string>(SKY_GROWTH_EVENT_TYPES);

function isEntry(raw: unknown): raw is SkyEvolutionEntry {
  if (!raw || typeof raw !== 'object') return false;
  const entry = raw as Partial<SkyEvolutionEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.eventType === 'string' &&
    EVENT_TYPES.has(entry.eventType) &&
    typeof entry.occurredAt === 'string' &&
    (entry.source === 'explicit' || entry.source === 'inferred' || entry.source === 'system') &&
    typeof entry.summary === 'string'
  );
}

export async function loadSkyEvolution(): Promise<SkyEvolutionRecord> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SKY_EVOLUTION;
    const parsed = JSON.parse(raw) as Partial<SkyEvolutionRecord>;
    if (!parsed || !Array.isArray(parsed.entries)) return EMPTY_SKY_EVOLUTION;
    return {
      entries: parsed.entries.filter(isEntry).slice(0, MAX_ENTRIES),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return EMPTY_SKY_EVOLUTION;
  }
}

export async function saveSkyEvolution(record: SkyEvolutionRecord): Promise<void> {
  const next: SkyEvolutionRecord = {
    entries: record.entries.slice(0, MAX_ENTRIES),
    updatedAt: record.updatedAt ?? new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function appendSkyEvolutionEntry(entry: SkyEvolutionEntry): Promise<SkyEvolutionRecord> {
  const current = await loadSkyEvolution();
  const next: SkyEvolutionRecord = {
    entries: [entry, ...current.entries].slice(0, MAX_ENTRIES),
    updatedAt: new Date().toISOString(),
  };
  await saveSkyEvolution(next);
  return next;
}

export function appendEvolutionEntryLocal(
  record: SkyEvolutionRecord,
  entry: SkyEvolutionEntry,
): SkyEvolutionRecord {
  return {
    entries: [entry, ...record.entries].slice(0, MAX_ENTRIES),
    updatedAt: new Date().toISOString(),
  };
}

export type { SkyGrowthEventType };
