import AsyncStorage from '@react-native-async-storage/async-storage';

import { isLegacyDemoEnabled } from '@/constants/devFlags';
import {
  buildLegacyDemoContributions,
  buildLegacyDemoLibraryState,
  buildLegacyDemoLocalSkywrites,
  buildLegacyDemoMetricsState,
  buildLegacyDemoSavedThreadsState,
  buildLegacyDemoThreadState,
  LEGACY_DEMO_SEED_VERSION,
  LEGACY_DEMO_SEED_VERSION_KEY,
  markLegacyDemoSeedApplied,
  shouldApplyLegacyDemoSeed,
} from '@/legacy/legacyDemoFixtures';
import { saveHumanPotentialMetricsState } from '@/humanPotential/humanPotentialPersistence';
import { saveSavedThreadsState } from '@/skywrite/savedThreads/savedThreadPersistence';
import {
  saveContributionRecords,
  saveSkywriteThreadState,
} from '@/skywrite/threads/skywriteThreadPersistence';
import { saveSkywriteLibraryState } from '@/skywrite/library/skywriteLibraryPersistence';
import { saveSkywrites } from '@/skywrite/persistence';

const SEED_LOCK_KEY = '@reellyou/legacy-demo-seed-lock';

let seedPromise: Promise<void> | null = null;

/** Dev-only: seed canonical Legacy demo stores once per seed version. */
export async function ensureLegacyDemoSeed(): Promise<void> {
  if (!isLegacyDemoEnabled()) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const locked = await AsyncStorage.getItem(SEED_LOCK_KEY);
    if (locked === 'running') return;
    await AsyncStorage.setItem(SEED_LOCK_KEY, 'running');
    try {
      if (!(await shouldApplyLegacyDemoSeed())) return;

      await saveHumanPotentialMetricsState(buildLegacyDemoMetricsState());
      await saveSavedThreadsState(buildLegacyDemoSavedThreadsState());
      await saveSkywriteThreadState(buildLegacyDemoThreadState());
      await saveContributionRecords(buildLegacyDemoContributions());
      await saveSkywriteLibraryState(buildLegacyDemoLibraryState());
      await saveSkywrites(buildLegacyDemoLocalSkywrites());
      await markLegacyDemoSeedApplied();
    } finally {
      await AsyncStorage.removeItem(SEED_LOCK_KEY);
    }
  })();

  return seedPromise;
}

export async function resetLegacyDemoSeedForDev(): Promise<void> {
  if (!isLegacyDemoEnabled()) return;
  await AsyncStorage.removeItem(LEGACY_DEMO_SEED_VERSION_KEY);
  seedPromise = null;
}

export { LEGACY_DEMO_SEED_VERSION };
