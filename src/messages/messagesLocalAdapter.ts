import { BETA_CONNECTED_USER_IDS } from '@/messages/messagesConnections';
import {
  acceptMessageRequestLocal,
  blockUserLocal,
  declineMessageRequestLocal,
  markThreadReadLocal,
  muteThreadLocal,
  openOrCreateThread,
  sendMessageLocal,
  type SendMessagePayload,
} from '@/messages/messagesLocalService';
import type { MessageService } from '@/messages/messagesServiceInterface';
import type { MessagesState } from '@/messages/messagesTypes';
import { reportUserSafety } from '@/safety/safetyActions';

/** LOCAL adapter — implements MessageService without pretending to hit a live server. */
export function createLocalMessageService(
  getState: () => MessagesState,
  setState: (next: MessagesState) => void,
  getSelfUserId: () => string | null,
): MessageService {
  return {
    async fetchThreads() {
      return getState();
    },
    async fetchMessages() {
      return getState();
    },
    async sendMessage(threadId, payload) {
      const selfUserId = getSelfUserId();
      if (!selfUserId) return getState();
      const next = sendMessageLocal(
        getState(),
        selfUserId,
        threadId,
        payload,
        BETA_CONNECTED_USER_IDS,
      );
      setState(next);
      return next;
    },
    async markThreadRead(threadId) {
      const next = markThreadReadLocal(getState(), threadId);
      setState(next);
      return next;
    },
    async openOrCreateThread(userId) {
      const selfUserId = getSelfUserId();
      if (!selfUserId) return getState();
      const next = openOrCreateThread(getState(), selfUserId, userId, BETA_CONNECTED_USER_IDS);
      setState(next);
      return next;
    },
    async acceptMessageRequest(threadId) {
      const next = acceptMessageRequestLocal(getState(), threadId);
      setState(next);
      return next;
    },
    async declineMessageRequest(threadId) {
      const next = declineMessageRequestLocal(getState(), threadId);
      setState(next);
      return next;
    },
    async muteThread(threadId) {
      const next = muteThreadLocal(getState(), threadId);
      setState(next);
      return next;
    },
    async blockUser(userId) {
      const selfUserId = getSelfUserId();
      if (!selfUserId) return getState();
      const next = blockUserLocal(getState(), selfUserId, userId);
      setState(next);
      return next;
    },
    async reportUser(params) {
      const selfUserId = getSelfUserId();
      if (!selfUserId) return { ok: false, localOnly: true, reportId: '' };
      const result = await reportUserSafety({ ...params, reporterUserId: selfUserId });
      return { ok: result.ok, localOnly: result.localOnly, reportId: result.reportId };
    },
  };
}

export type { SendMessagePayload };
