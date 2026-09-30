/** Release/beta gating — demo and dev-only surfaces stay off in production builds. */

export function isExploreDemoContentEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_ENABLE_EXPLORE_DEMO === '1';
}

export function isFriendDiscoveryDevFixtureEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_FRIEND_DISCOVERY_DEV_FIXTURES === '1';
}

export function isReelyouServerAuthEnabled(): boolean {
  return process.env.EXPO_PUBLIC_REELYOU_AUTH_ENABLED === 'true';
}

export function isProductionFriendDiscoveryReady(): boolean {
  const api = process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim();
  return Boolean(api) && isReelyouServerAuthEnabled();
}
