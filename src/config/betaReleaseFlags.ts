/** Release/beta gating — demo and dev-only surfaces stay off in production builds. */

export function isExploreDemoContentEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_ENABLE_EXPLORE_DEMO === '1';
}

export function isFriendDiscoveryDevFixtureEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_FRIEND_DISCOVERY_DEV_FIXTURES === '1';
}

/** On when API URL is set unless explicitly disabled (intended beta default). */
export function isReelyouServerAuthEnabled(): boolean {
  const api = process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim();
  if (!api) return false;
  return process.env.EXPO_PUBLIC_REELYOU_AUTH_ENABLED !== 'false';
}

export function isProductionFriendDiscoveryReady(): boolean {
  const api = process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim();
  return Boolean(api) && isReelyouServerAuthEnabled();
}

/** Google/Apple/Facebook sign-in is not wired in private beta — hide nonfunctional buttons. */
export function isThirdPartyOAuthSignInEnabled(): boolean {
  return process.env.EXPO_PUBLIC_OAUTH_SIGNIN_ENABLED === 'true';
}
