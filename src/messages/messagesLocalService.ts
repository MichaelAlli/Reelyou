import { currentUser } from '@/data/mockData';
import { canonicalThreadId } from '@/messages/messagesCanonical';
import { resolveOutboundDeliveryMode } from '@/messages/messagesEligibility';
import type { DirectMessage, MessageThread, MessagesState } from '@/messages/messagesTypes';

export interface SendMessagePayload {
  text: string;
}

function sortThreadIds(state: MessagesState, threadId: string): string[] {
  return [threadId, ...state.threadIds.filter((id) => id !== threadId)];
}

/** Local Beta message operations — future backend replaces internals. */
export function openOrCreateThread(
  state: MessagesState,
  otherUserId: string,
  connectedIds: string[],
): MessagesState {
  const threadId = canonicalThreadId(currentUser.id, otherUserId);
  if (state.threadsById[threadId]) return state;
  const mode = resolveOutboundDeliveryMode(otherUserId, connectedIds, state.blockedUserIds);
  if (mode === 'blocked') return state;
  const now = Date.now();
  const thread: MessageThread = {
    id: threadId,
    participantIds: [currentUser.id, otherUserId].sort(),
    createdAt: now,
    updatedAt: now,
    latestMessageId: null,
    unreadCount: 0,
    status: mode === 'request' ? 'request' : 'active',
  };
  return {
    ...state,
    threadsById: { ...state.threadsById, [threadId]: thread },
    threadIds: sortThreadIds(state, threadId),
  };
}

export function sendMessageLocal(
  state: MessagesState,
  threadId: string,
  payload: SendMessagePayload,
  connectedIds: string[],
): MessagesState {
  const text = payload.text.trim();
  if (!text) return state;
  let stateWithThread = state;
  const thread = state.threadsById[threadId];
  if (!thread) return state;

  const otherId = thread.participantIds.find((id) => id !== currentUser.id);
  if (!otherId) return state;

  const mode = resolveOutboundDeliveryMode(otherId, connectedIds, state.blockedUserIds);
  if (mode === 'blocked') return state;

  if (!thread.latestMessageId && mode === 'request' && thread.status !== 'request') {
    stateWithThread = {
      ...stateWithThread,
      threadsById: {
        ...stateWithThread.threadsById,
        [threadId]: { ...thread, status: 'request' },
      },
    };
  }

  const activeThread = stateWithThread.threadsById[threadId] ?? thread;
  const now = Date.now();
  const messageId = `msg-${threadId}-${now}`;
  const message: DirectMessage = {
    id: messageId,
    threadId,
    senderId: currentUser.id,
    text,
    createdAt: now,
    status: 'sent',
  };
  const updatedThread: MessageThread = {
    ...activeThread,
    updatedAt: now,
    latestMessageId: messageId,
    unreadCount: 0,
    status: activeThread.status === 'request' ? 'request' : 'active',
  };
  const unreadThreadIds = state.unreadThreadIds.filter((id) => id !== threadId);
  return {
    ...stateWithThread,
    messagesById: { ...stateWithThread.messagesById, [messageId]: message },
    threadsById: { ...stateWithThread.threadsById, [threadId]: updatedThread },
    threadIds: sortThreadIds(stateWithThread, threadId),
    unreadThreadIds,
  };
}

export function receiveIncomingRequestLocal(
  state: MessagesState,
  fromUserId: string,
  text: string,
): MessagesState {
  const threadId = canonicalThreadId(currentUser.id, fromUserId);
  if (state.blockedUserIds.includes(fromUserId)) return state;
  const now = Date.now();
  const messageId = `msg-${threadId}-in-${now}`;
  const message: DirectMessage = {
    id: messageId,
    threadId,
    senderId: fromUserId,
    text,
    createdAt: now,
    status: 'delivered',
  };
  const thread: MessageThread = {
    id: threadId,
    participantIds: [currentUser.id, fromUserId].sort(),
    createdAt: now,
    updatedAt: now,
    latestMessageId: messageId,
    unreadCount: 1,
    status: 'request',
  };
  const request = {
    threadId,
    fromUserId,
    createdAt: now,
    previewText: text,
    latestMessageId: messageId,
  };
  const messageRequests = [
    request,
    ...state.messageRequests.filter((r) => r.threadId !== threadId),
  ];
  return {
    ...state,
    messagesById: { ...state.messagesById, [messageId]: message },
    threadsById: { ...state.threadsById, [threadId]: thread },
    threadIds: state.threadIds.includes(threadId) ? state.threadIds : [threadId, ...state.threadIds],
    unreadThreadIds: state.unreadThreadIds.includes(threadId)
      ? state.unreadThreadIds
      : [...state.unreadThreadIds, threadId],
    messageRequests,
  };
}

export function acceptMessageRequestLocal(state: MessagesState, threadId: string): MessagesState {
  const thread = state.threadsById[threadId];
  if (!thread || thread.status !== 'request') return state;
  return {
    ...state,
    threadsById: {
      ...state.threadsById,
      [threadId]: { ...thread, status: 'active', unreadCount: 0 },
    },
    messageRequests: state.messageRequests.filter((r) => r.threadId !== threadId),
    unreadThreadIds: state.unreadThreadIds.filter((id) => id !== threadId),
  };
}

export function declineMessageRequestLocal(state: MessagesState, threadId: string): MessagesState {
  const thread = state.threadsById[threadId];
  if (!thread) return state;
  const { [threadId]: _removed, ...restThreads } = state.threadsById;
  const messageIdsToRemove = new Set(
    Object.values(state.messagesById)
      .filter((m) => m.threadId === threadId)
      .map((m) => m.id),
  );
  const messagesById = Object.fromEntries(
    Object.entries(state.messagesById).filter(([id]) => !messageIdsToRemove.has(id)),
  );
  return {
    ...state,
    threadsById: restThreads,
    threadIds: state.threadIds.filter((id) => id !== threadId),
    messagesById,
    messageRequests: state.messageRequests.filter((r) => r.threadId !== threadId),
    unreadThreadIds: state.unreadThreadIds.filter((id) => id !== threadId),
  };
}

export function markThreadReadLocal(state: MessagesState, threadId: string): MessagesState {
  const thread = state.threadsById[threadId];
  if (!thread || thread.unreadCount === 0) return state;
  return {
    ...state,
    threadsById: {
      ...state.threadsById,
      [threadId]: { ...thread, unreadCount: 0 },
    },
    unreadThreadIds: state.unreadThreadIds.filter((id) => id !== threadId),
  };
}

export function muteThreadLocal(state: MessagesState, threadId: string): MessagesState {
  if (state.mutedThreadIds.includes(threadId)) return state;
  return { ...state, mutedThreadIds: [...state.mutedThreadIds, threadId] };
}

export function unmuteThreadLocal(state: MessagesState, threadId: string): MessagesState {
  return { ...state, mutedThreadIds: state.mutedThreadIds.filter((id) => id !== threadId) };
}

export function limitUserLocal(state: MessagesState, userId: string): MessagesState {
  if (state.limitedUserIds.includes(userId)) return state;
  return { ...state, limitedUserIds: [...state.limitedUserIds, userId] };
}

export function removeLimitUserLocal(state: MessagesState, userId: string): MessagesState {
  if (!state.limitedUserIds.includes(userId)) return state;
  return {
    ...state,
    limitedUserIds: state.limitedUserIds.filter((id) => id !== userId),
  };
}

export function unblockUserLocal(state: MessagesState, userId: string): MessagesState {
  if (!state.blockedUserIds.includes(userId)) return state;
  return {
    ...state,
    blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
  };
}

export function blockUserLocal(state: MessagesState, userId: string): MessagesState {
  if (state.blockedUserIds.includes(userId)) return state;
  const threadId = canonicalThreadId(currentUser.id, userId);
  let next: MessagesState = {
    ...state,
    blockedUserIds: [...state.blockedUserIds, userId],
    limitedUserIds: state.limitedUserIds.filter((id) => id !== userId),
  };
  next = declineMessageRequestLocal(next, threadId);
  return next;
}

export function inboxThreadIds(state: MessagesState): string[] {
  const pendingIncoming = new Set(state.messageRequests.map((r) => r.threadId));
  return state.threadIds.filter((id) => {
    const thread = state.threadsById[id];
    if (!thread) return false;
    if (thread.status === 'request' && pendingIncoming.has(id)) return false;
    return true;
  });
}

export function threadMessages(state: MessagesState, threadId: string): DirectMessage[] {
  return Object.values(state.messagesById)
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
