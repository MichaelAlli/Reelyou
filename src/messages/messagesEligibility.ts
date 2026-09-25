import type { MessagingPreferences, WhoCanMessage } from '@/preferences/userPreferencesTypes';

export function isConnectedUser(userId: string, connectedIds: string[]): boolean {
  return connectedIds.includes(userId);
}

/** Who may appear in New Message search and message actions. */
export function canInitiateMessage(
  targetUserId: string,
  prefs: MessagingPreferences,
  connectedIds: string[],
  blockedUserIds: string[],
  limitedUserIds: readonly string[] = [],
): boolean {
  if (blockedUserIds.includes(targetUserId)) return false;
  if (limitedUserIds.includes(targetUserId)) return false;
  if (prefs.whoCanMessage === 'nobody') return false;
  const connected = isConnectedUser(targetUserId, connectedIds);
  if (connected) return true;
  if (prefs.whoCanMessage === 'connections_only') return false;
  return prefs.whoCanMessage === 'message_requests';
}

/** Delivery mode when current user sends to target (receiver policy simulated as shared Beta rules). */
export function resolveOutboundDeliveryMode(
  targetUserId: string,
  connectedIds: string[],
  blockedUserIds: string[],
  receiverWhoCanMessage: WhoCanMessage = 'message_requests',
): 'direct' | 'request' | 'blocked' {
  if (blockedUserIds.includes(targetUserId)) return 'blocked';
  if (isConnectedUser(targetUserId, connectedIds)) return 'direct';
  if (receiverWhoCanMessage === 'nobody' || receiverWhoCanMessage === 'connections_only') {
    return 'blocked';
  }
  return 'request';
}

export function incomingRequestsEnabled(prefs: MessagingPreferences): boolean {
  return prefs.whoCanMessage === 'message_requests';
}
