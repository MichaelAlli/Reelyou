/** Facebook friend discovery requires Meta app review + eligible API access. */

export function isFacebookFriendDiscoveryConfigured(): boolean {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID?.trim();
  return Boolean(appId && process.env.EXPO_PUBLIC_FACEBOOK_FRIEND_DISCOVERY_ENABLED === 'true');
}

export const FACEBOOK_DISCOVERY_BLOCKER =
  'Facebook friend matching is not enabled in this build. Link your Meta app, complete Login review, and set EXPO_PUBLIC_FACEBOOK_FRIEND_DISCOVERY_ENABLED=true after API access is approved.';
