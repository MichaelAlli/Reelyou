import type { SendMessagePayload } from '@/messages/messagesLocalService';
import type { MessagesState } from '@/messages/messagesTypes';
import type { SafetyReportReason } from '@/safety/safetyActions';

/** Future backend message service boundary — no client API keys. */
export interface MessageService {
  fetchThreads(): Promise<MessagesState>;
  fetchMessages(threadId: string): Promise<MessagesState>;
  sendMessage(threadId: string, payload: SendMessagePayload): Promise<MessagesState>;
  markThreadRead(threadId: string): Promise<MessagesState>;
  openOrCreateThread(userId: string): Promise<MessagesState>;
  acceptMessageRequest(threadId: string): Promise<MessagesState>;
  declineMessageRequest(threadId: string): Promise<MessagesState>;
  muteThread(threadId: string): Promise<MessagesState>;
  blockUser(userId: string): Promise<MessagesState>;
  reportUser(params: {
    reportedUserId: string;
    threadId?: string;
    reason?: SafetyReportReason;
  }): Promise<{ ok: boolean; localOnly: boolean; reportId: string }>;
}
