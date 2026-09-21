import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadUserAvatarIdentity } from '@/identity/userAvatarPersistence';
import { DEFAULT_USER_AVATAR_IDENTITY } from '@/identity/userAvatarTypes';
import { loadEmotionalContext } from '@/starpath/starpathEmotionalContextPersistence';
import { DEFAULT_EMOTIONAL_CONTEXT } from '@/starpath/starpathEmotionalContextTypes';
import { boundInteractionSignals } from '@/starpath/starpathInteractionBounds';
import {
  migrateDynamicWorld,
  migrateGuidanceState,
  migrateInteractionSnapshot,
  migrateResourceState,
  migrateSignalState,
} from '@/starpath/starpathPersistenceMigrations';
import { safeJsonParse } from '@/starpath/starpathPersistenceRecovery';
import {
  STARPATH_PERSISTENCE_MANIFEST_KEY,
  STARPATH_STATE_VERSION,
  type StarPathAuthoritativeBundle,
  type StarPathPersistenceManifest,
  type StarPathRecoveryReport,
} from '@/starpath/starpathPersistenceTypes';
import { loadStarPathUiChrome } from '@/starpath/starpathUiChromePersistence';
import { loadStarPathViewport } from '@/starpath/starpathViewportPersistence';
import type { StarPathInteractionSnapshot } from '@/starpath/starpathInteractionTypes';
import type { StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import type { StarPathGuidanceState } from '@/starpath/starpathGuidanceTypes';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import type { StarPathSignalState } from '@/starpath/starpathSignalTypes';

const DOMAIN_KEYS = {
  interactions: '@reellyou/starpath-interactions',
  dynamicWorld: '@reellyou/starpath-dynamic-world',
  guidance: '@reellyou/starpath-guidance',
  resources: '@reellyou/starpath-resources',
  signals: '@reellyou/starpath-signals',
} as const;

async function loadDomainRaw(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Single hydration entry for StarPath Beta — migrate, recover partial state, never throw.
 */
export async function hydrateStarPathAuthoritativeState(): Promise<{
  bundle: StarPathAuthoritativeBundle;
  recovery: StarPathRecoveryReport;
}> {
  const issues: StarPathRecoveryReport['issues'] = [];
  const notes: string[] = [];
  const now = Date.now();

  const [
    manifestRaw,
    interactionsRaw,
    dynamicRaw,
    guidanceRaw,
    resourcesRaw,
    signalsRaw,
    avatarIdentity,
    emotional,
    viewport,
    uiChrome,
  ] = await Promise.all([
    AsyncStorage.getItem(STARPATH_PERSISTENCE_MANIFEST_KEY),
    loadDomainRaw(DOMAIN_KEYS.interactions),
    loadDomainRaw(DOMAIN_KEYS.dynamicWorld),
    loadDomainRaw(DOMAIN_KEYS.guidance),
    loadDomainRaw(DOMAIN_KEYS.resources),
    loadDomainRaw(DOMAIN_KEYS.signals),
    loadUserAvatarIdentity().catch(() => DEFAULT_USER_AVATAR_IDENTITY),
    loadEmotionalContext().catch(() => ({ ...DEFAULT_EMOTIONAL_CONTEXT })),
    loadStarPathViewport().catch(() => null),
    loadStarPathUiChrome().catch(() => null),
  ]);

  const manifestParsed = safeJsonParse<StarPathPersistenceManifest>(manifestRaw);
  let manifest: StarPathPersistenceManifest = {
    starPathStateVersion: STARPATH_STATE_VERSION,
    lastSavedAt: manifestParsed.value?.lastSavedAt ?? 0,
    lastHydratedAt: now,
  };
  if (manifestParsed.value?.starPathStateVersion && manifestParsed.value.starPathStateVersion !== STARPATH_STATE_VERSION) {
    issues.push('migration_applied');
    notes.push(`manifest ${manifestParsed.value.starPathStateVersion} → ${STARPATH_STATE_VERSION}`);
    manifest = { ...manifest, starPathStateVersion: STARPATH_STATE_VERSION };
  }

  const interactionsParse = safeJsonParse<Partial<StarPathInteractionSnapshot>>(interactionsRaw);
  if (!interactionsParse.ok) issues.push('interactions_corrupt');
  let interactions = migrateInteractionSnapshot(interactionsParse.value);
  if ((interactionsParse.value?.version ?? 1) < 2) {
    issues.push('migration_applied');
  }
  interactions = { ...interactions, signals: boundInteractionSignals(interactions.signals) };

  const dynamicParse = safeJsonParse<Partial<StarPathDynamicWorldState>>(dynamicRaw);
  if (!dynamicParse.ok) issues.push('dynamic_world_corrupt');
  const dynamicWorld = migrateDynamicWorld(dynamicParse.value);

  const guidanceParse = safeJsonParse<Partial<StarPathGuidanceState>>(guidanceRaw);
  if (!guidanceParse.ok) issues.push('guidance_corrupt');
  const guidance = migrateGuidanceState(guidanceParse.value);

  const resourcesParse = safeJsonParse<Partial<StarPathResourceState>>(resourcesRaw);
  if (!resourcesParse.ok) issues.push('resources_corrupt');
  const resources = migrateResourceState(resourcesParse.value);

  const signalsParse = safeJsonParse<Partial<StarPathSignalState>>(signalsRaw);
  if (!signalsParse.ok) issues.push('signals_corrupt');
  const signals = migrateSignalState(signalsParse.value);

  if (!avatarIdentity) {
    issues.push('avatar_corrupt');
  }

  const bundle: StarPathAuthoritativeBundle = {
    manifest,
    interactions,
    avatarIdentity: avatarIdentity ?? DEFAULT_USER_AVATAR_IDENTITY,
    dynamicWorld,
    guidance,
    resources,
    signals,
    emotional: emotional ?? { ...DEFAULT_EMOTIONAL_CONTEXT },
    viewport,
    uiChrome,
  };

  return {
    bundle,
    recovery: {
      ok: issues.filter((i) => i.endsWith('_corrupt')).length === 0 || interactions.signals.length > 0 || dynamicWorld.nodes.length > 0,
      issues,
      notes,
    },
  };
}

export async function touchStarPathPersistenceManifest(): Promise<void> {
  const manifest: StarPathPersistenceManifest = {
    starPathStateVersion: STARPATH_STATE_VERSION,
    lastSavedAt: Date.now(),
    lastHydratedAt: Date.now(),
  };
  await AsyncStorage.setItem(STARPATH_PERSISTENCE_MANIFEST_KEY, JSON.stringify(manifest));
}
