import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

const STORAGE_KEY = 'reelyou.mySky.starIntro.v1';

export interface MySkyStarIntroState {
  hasSeenSkywriteStarIntro: boolean;
  hasSeenMySkyStarIntro: boolean;
  hasSeenFirstStarReinforcement: boolean;
  /** Brief identity-star emphasis during first My Sky intro. */
  identityStarIntroPulseDone: boolean;
}

const EMPTY: MySkyStarIntroState = {
  hasSeenSkywriteStarIntro: false,
  hasSeenMySkyStarIntro: false,
  hasSeenFirstStarReinforcement: false,
  identityStarIntroPulseDone: false,
};

function parse(raw: string | null): MySkyStarIntroState {
  if (!raw) return { ...EMPTY };
  try {
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<MySkyStarIntroState>) };
  } catch {
    return { ...EMPTY };
  }
}

export async function loadMySkyStarIntroState(): Promise<MySkyStarIntroState> {
  return readScopedJson(STORAGE_KEY, parse);
}

export async function saveMySkyStarIntroState(state: MySkyStarIntroState): Promise<void> {
  await writeScopedJson(STORAGE_KEY, state);
}

export async function markSkywriteStarIntroSeen(): Promise<MySkyStarIntroState> {
  const current = await loadMySkyStarIntroState();
  const next = { ...current, hasSeenSkywriteStarIntro: true };
  await saveMySkyStarIntroState(next);
  return next;
}

export async function markMySkyStarIntroSeen(): Promise<MySkyStarIntroState> {
  const current = await loadMySkyStarIntroState();
  const next = {
    ...current,
    hasSeenMySkyStarIntro: true,
    identityStarIntroPulseDone: true,
  };
  await saveMySkyStarIntroState(next);
  return next;
}

export async function markFirstStarReinforcementSeen(): Promise<void> {
  const current = await loadMySkyStarIntroState();
  await saveMySkyStarIntroState({ ...current, hasSeenFirstStarReinforcement: true });
}

/** Re-open star meaning help from Settings without resetting other onboarding. */
export async function resetMySkyStarIntroForHelpReplay(): Promise<void> {
  const current = await loadMySkyStarIntroState();
  await saveMySkyStarIntroState({
    ...current,
    hasSeenSkywriteStarIntro: false,
    hasSeenMySkyStarIntro: false,
  });
}
