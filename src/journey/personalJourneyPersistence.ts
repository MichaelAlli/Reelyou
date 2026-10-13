import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

export interface PersonalJourneySettings {
  customTitle: string | null;
  orderedSkywriteIds: string[];
  updatedAt: number;
}

const STORAGE_KEY = '@reelyou/personal-journey/v1';

export const EMPTY_PERSONAL_JOURNEY: PersonalJourneySettings = {
  customTitle: null,
  orderedSkywriteIds: [],
  updatedAt: 0,
};

function parse(raw: unknown): PersonalJourneySettings {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PERSONAL_JOURNEY };
  const entry = raw as Partial<PersonalJourneySettings>;
  return {
    customTitle:
      typeof entry.customTitle === 'string'
        ? entry.customTitle
        : entry.customTitle === null
          ? null
          : null,
    orderedSkywriteIds: Array.isArray(entry.orderedSkywriteIds)
      ? entry.orderedSkywriteIds.filter((id): id is string => typeof id === 'string')
      : [],
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : 0,
  };
}

export async function loadLocalPersonalJourney(): Promise<PersonalJourneySettings> {
  return readScopedJson(STORAGE_KEY, (raw) => {
    if (!raw) return { ...EMPTY_PERSONAL_JOURNEY };
    try {
      return parse(JSON.parse(raw));
    } catch {
      return { ...EMPTY_PERSONAL_JOURNEY };
    }
  });
}

export async function saveLocalPersonalJourney(settings: PersonalJourneySettings): Promise<void> {
  await writeScopedJson(STORAGE_KEY, settings);
}
