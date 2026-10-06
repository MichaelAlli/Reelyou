import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

/** Central Beta product flags — flip to re-enable features after Beta. */
export const BetaFeatures = {
  standaloneAudioSkywrites: false,
  /** Future journey themes / Silver Linings — no public UI or background AI while false. */
  silverLinings: false,
  /** Saved Threads tab — hidden during Beta; data preserved for future JourneyThread migration. */
  savedThreadsPublicUi: false,
} as const;

/** Direct messages — local-only until server-backed chat ships. Hidden when real auth is on. */
export function directMessagesEnabled(): boolean {
  if (isReelyouAuthConfigured()) return false;
  return isExplicitDevDemoModeEnabled();
}

/** Legacy Ripple demo metrics — dev demo only. */
export function legacyRippleEnabled(): boolean {
  return isExplicitDevDemoModeEnabled();
}

export function silverLiningsEnabled(): boolean {
  return BetaFeatures.silverLinings;
}

export function savedThreadsPublicUiEnabled(): boolean {
  return BetaFeatures.savedThreadsPublicUi;
}
