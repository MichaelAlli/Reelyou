export const MESSAGING_VERSION = 'beta-v1';

export type ThreadStatus = 'active' | 'request' | 'archived';

export interface MessageThread {
  id: string;
  participantIds: string[];
  createdAt: number;
  updatedAt: number;
  latestMessageId: string | null;
  unreadCount: number;
  status: ThreadStatus;
}

export interface DirectMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: number;
  status: 'sent' | 'delivered';
}

export interface MessageRequest {
  threadId: string;
  fromUserId: string;
  createdAt: number;
  previewText: string;
  latestMessageId: string;
}

export interface MessagesState {
  messagingVersion: typeof MESSAGING_VERSION;
  threadsById: Record<string, MessageThread>;
  threadIds: string[];
  messagesById: Record<string, DirectMessage>;
  unreadThreadIds: string[];
  mutedThreadIds: string[];
  blockedUserIds: string[];
  /** Soft boundary — distinct from block; Beta stores user ids only. */
  limitedUserIds: string[];
  messageRequests: MessageRequest[];
}

export const EMPTY_MESSAGES_STATE: MessagesState = {
  messagingVersion: MESSAGING_VERSION,
  threadsById: {},
  threadIds: [],
  messagesById: {},
  unreadThreadIds: [],
  mutedThreadIds: [],
  blockedUserIds: [],
  limitedUserIds: [],
  messageRequests: [],
};
