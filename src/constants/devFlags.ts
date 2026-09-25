/**
 * DEV-only feature flags — flip before release.
 *
 * Screen Preview requires BOTH `__DEV__` and `DEV_SCREEN_PREVIEW_ENABLED`.
 * Set `DEV_SCREEN_PREVIEW_ENABLED` to false to disable preview in dev builds
 * without removing any preview code.
 */
export const DEV_SCREEN_PREVIEW_ENABLED = true;

/**
 * When true (and preview is enabled), dev builds open to Screen Preview on launch
 * instead of Splash. Set to false to restore normal Splash startup in development.
 */
export const DEV_SCREEN_PREVIEW_STARTUP = false;

/**
 * When true in __DEV__, seeds 12 canonical contribution beacons for the demo user
 * (Focused Skywrite indicator + Signal Center). Never active in production builds.
 */
export const CONTRIBUTION_BEACON_DEMO_ENABLED = true;

/** When true in __DEV__, seeds canonical Legacy + human-potential demo history for Michael. */
export const LEGACY_DEMO_ENABLED = true;

/** Dev-only Emerging Constellation suggestion + community infrastructure QA. */
export const EMERGING_CONSTELLATION_DEMO_ENABLED = true;

/** Dev-only StarPath door glow + growth world-signal QA on `/starpath`. */
export const STARPATH_WORLD_SIGNAL_DEMO_ENABLED = false;

declare const __DEV__: boolean | undefined;

export function isDevRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/** True when contribution beacon demo fixtures are active. */
export function isContributionBeaconDemoEnabled(): boolean {
  return isDevRuntime() && CONTRIBUTION_BEACON_DEMO_ENABLED;
}

export function isLegacyDemoEnabled(): boolean {
  return isDevRuntime() && LEGACY_DEMO_ENABLED;
}

export function isEmergingConstellationDemoEnabled(): boolean {
  return isDevRuntime() && EMERGING_CONSTELLATION_DEMO_ENABLED;
}

export function isStarpathWorldSignalDemoEnabled(): boolean {
  return isDevRuntime() && STARPATH_WORLD_SIGNAL_DEMO_ENABLED;
}

/** True when Screen Preview route and launcher are active. */
export function isScreenPreviewEnabled(): boolean {
  return isDevRuntime() && DEV_SCREEN_PREVIEW_ENABLED;
}

/** True when dev app should boot directly into Screen Preview. Never true in production. */
export function isScreenPreviewStartupEnabled(): boolean {
  return isScreenPreviewEnabled() && DEV_SCREEN_PREVIEW_STARTUP;
}

let devPreviewStartupConsumed = false;

/**
 * Returns true only on the first app entry in a dev session, so `/` can still
 * open Splash from the preview menu after the initial boot redirect.
 */
export function consumeDevPreviewStartupRedirect(): boolean {
  if (!isScreenPreviewStartupEnabled() || devPreviewStartupConsumed) {
    return false;
  }
  devPreviewStartupConsumed = true;
  return true;
}
