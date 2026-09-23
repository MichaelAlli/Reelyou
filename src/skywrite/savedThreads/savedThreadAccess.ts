import { BETA_CONNECTED_USER_IDS } from '@/messages/messagesConnections';
import type { SkywriteRecord } from '@/skywrite/types';

export type SavedThreadSourceAccess = 'available' | 'inaccessible';

export function resolveSavedThreadSourceAccess(input: {
  skywrite: (SkywriteRecord & { authorId: string }) | null;
  blockedUserIds: readonly string[];
  viewerId: string;
}): SavedThreadSourceAccess {
  const { skywrite, blockedUserIds, viewerId } = input;
  if (!skywrite) return 'inaccessible';
  if (blockedUserIds.includes(skywrite.authorId)) return 'inaccessible';
  if (skywrite.authorId === viewerId) return 'available';
  if (skywrite.visibility === 'public') return 'available';
  if (skywrite.visibility === 'orbit') {
    return BETA_CONNECTED_USER_IDS.includes(skywrite.authorId) ? 'available' : 'inaccessible';
  }
  return 'inaccessible';
}
