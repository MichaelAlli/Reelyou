import type { UserAvatarIdentity } from '@/identity/userAvatarTypes';
import type { StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import type { StarPathGuidanceState } from '@/starpath/starpathGuidanceTypes';
import type { StarPathInteractionSnapshot } from '@/starpath/starpathInteractionTypes';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import type { StarPathSignalState } from '@/starpath/starpathSignalTypes';
import type { StarPathEmotionalContext } from '@/starpath/starpathEmotionalContextTypes';

/** Top-level StarPath Beta persistence schema version. */
export const STARPATH_STATE_VERSION = 'beta-v1';

export const STARPATH_PERSISTENCE_MANIFEST_KEY = '@reellyou/starpath-persistence-manifest';

export interface StarPathPersistenceManifest {
  starPathStateVersion: typeof STARPATH_STATE_VERSION;
  lastSavedAt: number;
  lastHydratedAt: number;
}

export interface StarPathViewportSnapshot {
  scrollY: number;
  worldExpansionPx: number;
  viewportHeight: number;
  savedAt: number;
}

export interface StarPathUiChromeSnapshot {
  guideExpanded: boolean;
  nextStepExpanded: boolean;
  savedAt: number;
}

/** Authoritative persisted domains — restored on hydrate. */
export interface StarPathAuthoritativeBundle {
  manifest: StarPathPersistenceManifest;
  interactions: StarPathInteractionSnapshot;
  avatarIdentity: UserAvatarIdentity;
  dynamicWorld: StarPathDynamicWorldState;
  guidance: StarPathGuidanceState;
  resources: StarPathResourceState;
  signals: StarPathSignalState;
  emotional: StarPathEmotionalContext;
  viewport: StarPathViewportSnapshot | null;
  uiChrome: StarPathUiChromeSnapshot | null;
}

export type StarPathRecoveryIssue =
  | 'interactions_corrupt'
  | 'dynamic_world_corrupt'
  | 'guidance_corrupt'
  | 'resources_corrupt'
  | 'signals_corrupt'
  | 'avatar_corrupt'
  | 'emotional_corrupt'
  | 'viewport_corrupt'
  | 'ui_chrome_corrupt'
  | 'migration_applied';

export interface StarPathRecoveryReport {
  ok: boolean;
  issues: StarPathRecoveryIssue[];
  /** Development-only diagnostic strings. */
  notes: string[];
}

/** Derived at runtime — not authoritative persistence. */
export const STARPATH_DERIVED_DOMAINS = [
  'siftingState',
  'activeGuidePresentation',
  'activeNextStepPresentation',
  'ambientSignalLevels',
  'opportunitySiftScores',
  'transientHighlightPulse',
] as const;
