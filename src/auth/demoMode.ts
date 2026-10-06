import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

declare const __DEV__: boolean | undefined;

/**
 * Explicit opt-in demo fixtures (Michael, seeded skywrites, legacy demo, etc.).
 * Default OFF — set EXPO_PUBLIC_ENABLE_DEMO_MODE=1 in local .env to enable in __DEV__ only.
 */
export function isExplicitDevDemoModeEnabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === '1';
}

/** True when the app runs without server auth (no API URL / auth disabled). Not the Beta path. */
export function isOfflineAuthDisabledBuild(): boolean {
  return !isReelyouAuthConfigured();
}

/** Beta/production path uses real server auth — no mock Michael identity. */
export function isRealAuthBetaPath(): boolean {
  return isReelyouAuthConfigured();
}
