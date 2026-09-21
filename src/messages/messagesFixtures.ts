/**
 * FIXTURE-ONLY local messaging seed — not live multi-user chat.
 */
import { currentUser } from '@/data/mockData';
import { canonicalThreadId } from '@/messages/messagesCanonical';
import { receiveIncomingRequestLocal } from '@/messages/messagesLocalService';
import type { DirectMessage, MessageThread, MessagesState } from '@/messages/messagesTypes';

const NOW = Date.now() - 3600_000;

function seedThread(
  otherUserId: string,
  preview: string,
  unread: boolean,
): { thread: MessageThread; message: DirectMessage } {
  const threadId = canonicalThreadId(currentUser.id, otherUserId);
  const messageId = `msg-${threadId}-1`;
  const thread: MessageThread = {
    id: threadId,
    participantIds: [currentUser.id, otherUserId].sort(),
    createdAt: NOW,
    updatedAt: NOW,
    latestMessageId: messageId,
    unreadCount: unread ? 1 : 0,
    status: 'active',
  };
  const message: DirectMessage = {
    id: messageId,
    threadId,
    senderId: otherUserId,
    text: preview,
    createdAt: NOW,
    status: 'delivered',
  };
  return { thread, message };
}

export function buildFixtureMessagesState(): MessagesState {
  const a = seedThread('orbit-jordan', 'Would love to hear how your Starpath is going.', true);
  const b = seedThread('orbit-1', 'Thanks for the encouragement on my last Skywrite.', false);
  const threadsById = { [a.thread.id]: a.thread, [b.thread.id]: b.thread };
  const messagesById = { [a.message.id]: a.message, [b.message.id]: b.message };
  let state: MessagesState = {
    messagingVersion: 'beta-v1',
    threadsById,
    threadIds: [a.thread.id, b.thread.id].sort((x, y) => threadsById[y].updatedAt - threadsById[x].updatedAt),
    messagesById,
    unreadThreadIds: a.thread.unreadCount ? [a.thread.id] : [],
    mutedThreadIds: [],
    blockedUserIds: [],
    messageRequests: [],
  };
  state = receiveIncomingRequestLocal(
    state,
    'orbit-3',
    'Hi — I loved your recent Skywrite. Open to connecting?',
  );
  return state;
}
