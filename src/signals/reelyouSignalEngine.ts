import { orbitUsers } from '@/data/mockData';
import { otherParticipantId } from '@/messages/messagesCanonical';
import type { MessagesState } from '@/messages/messagesTypes';
import type {
  DiscoveryPreferences,
  MessagingPreferences,
  SignalCategoryPreferences,
} from '@/preferences/userPreferencesTypes';
import {
  communitySignalsFromFeed,
  connectionSignalsFromFeed,
  savedStarpathRevisitSignal,
  starpathOpportunitySignalsFromState,
  type ReelyouSignalSources,
} from '@/signals/reelyouSignalSources';
import type { ReelyouSignal, ReelyouSignalsMetaState } from '@/signals/reelyouSignalTypes';

const MAX_SIGNALS = 8;
const QUIET_MAX_SIGNALS = 3;

function userName(userId: string): string {
  return orbitUsers.find((u) => u.id === userId)?.name ?? 'Connection';
}

export function buildReelyouSignals(
  messages: MessagesState,
  prefs: SignalCategoryPreferences,
  messagingPrefs: MessagingPreferences,
  discoveryPrefs: DiscoveryPreferences,
  meta: ReelyouSignalsMetaState,
  sources: ReelyouSignalSources,
  now: number,
): ReelyouSignal[] {
  const out: ReelyouSignal[] = [];
  const quiet = prefs.quietMode;

  if (prefs.messages && !messagingPrefs.muteMessageSignals) {
    for (const threadId of messages.unreadThreadIds) {
      if (messages.mutedThreadIds.includes(threadId)) continue;
      const thread = messages.threadsById[threadId];
      if (!thread || thread.unreadCount === 0) continue;
      if (thread.status === 'request') continue;
      const otherId = otherParticipantId(thread.participantIds);
      if (!otherId || messages.blockedUserIds.includes(otherId)) continue;
      const latest = thread.latestMessageId ? messages.messagesById[thread.latestMessageId] : undefined;
      const signalId = `sig-msg-${threadId}`;
      if (meta.dismissedSignalIds.includes(signalId)) continue;
      if ((meta.snoozedUntil[signalId] ?? 0) > now) continue;
      out.push({
        signalId,
        type: 'messages',
        title: `Message from ${userName(otherId)}`,
        description:
          prefs.showMessagePreview && latest?.text
            ? latest.text
            : 'New message waiting for you.',
        createdAt: latest?.createdAt ?? thread.updatedAt,
        sourceId: threadId,
        destinationRoute: '/messages/[threadId]',
        destinationParams: { threadId },
        read: meta.acknowledgedSignalIds.includes(signalId),
        priority: 'elevated',
        dismissible: true,
      });
    }
  }

  if (prefs.connections && !quiet) {
    for (const item of connectionSignalsFromFeed(sources.homeFeed, now)) {
      if (meta.dismissedSignalIds.includes(item.signalId)) continue;
      if ((meta.snoozedUntil[item.signalId] ?? 0) > now) continue;
      out.push({
        signalId: item.signalId,
        type: 'connections',
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        sourceId: item.signalId,
        destinationRoute: item.route,
        read: meta.acknowledgedSignalIds.includes(item.signalId),
        priority: 'normal',
        dismissible: true,
      });
    }
  }

  if (prefs.opportunities && discoveryPrefs.showOpportunityDiscovery && !quiet) {
    for (const beacon of sources.contributionBeacons ?? []) {
      if (meta.dismissedSignalIds.includes(beacon.signalId)) continue;
      if ((meta.snoozedUntil[beacon.signalId] ?? 0) > now) continue;
      out.push({
        signalId: beacon.signalId,
        type: 'contribution_beacon',
        title: beacon.title,
        description: beacon.description,
        createdAt: beacon.createdAt,
        sourceId: beacon.skywriteId,
        destinationRoute: `/skywrite/${beacon.skywriteId}`,
        destinationParams: { skywriteId: beacon.skywriteId, source: 'beacon' },
        read: meta.acknowledgedSignalIds.includes(beacon.signalId),
        priority: 'normal',
        dismissible: true,
      });
    }
  }

  if (
    prefs.opportunities &&
    discoveryPrefs.showOpportunityDiscovery &&
    !quiet
  ) {
    for (const item of starpathOpportunitySignalsFromState(sources.starpathResourceState, now)) {
      if (meta.dismissedSignalIds.includes(item.signalId)) continue;
      if ((meta.snoozedUntil[item.signalId] ?? 0) > now) continue;
      out.push({
        signalId: item.signalId,
        type: 'opportunities',
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        sourceId: item.nodeId,
        destinationRoute: '/starpath',
        destinationParams: { opportunityNodeId: item.nodeId },
        read: meta.acknowledgedSignalIds.includes(item.signalId),
        priority: item.timeSensitive ? 'time_sensitive' : 'elevated',
        dismissible: true,
      });
    }
    const saved = savedStarpathRevisitSignal(sources.starpathResourceState, now);
    if (saved && !meta.dismissedSignalIds.includes(saved.signalId)) {
      out.push({
        signalId: saved.signalId,
        type: 'opportunities',
        title: saved.title,
        description: saved.description,
        createdAt: saved.createdAt,
        sourceId: saved.nodeId,
        destinationRoute: '/starpath',
        destinationParams: { opportunityNodeId: saved.nodeId },
        read: meta.acknowledgedSignalIds.includes(saved.signalId),
        priority: 'normal',
        dismissible: true,
      });
    }
  }

  if (prefs.skyActivity && !quiet && sources.homeFeed) {
    for (const item of sources.homeFeed.items) {
      if (item.destination !== 'skywrite') continue;
      const signalId = `sig-sky-${item.id}`;
      if (meta.dismissedSignalIds.includes(signalId)) continue;
      const skywriteId = item.contentId ?? item.id;
      out.push({
        signalId,
        type: 'sky_activity',
        title: item.message,
        description: item.preview ?? 'Sky activity',
        createdAt: new Date(item.timestamp).getTime() || now,
        sourceId: item.id,
        destinationRoute: '/skywrite',
        destinationParams: { skywriteId },
        read: meta.acknowledgedSignalIds.includes(signalId),
        priority: 'normal',
        dismissible: true,
      });
    }
  }

  if (prefs.communities && !quiet) {
    for (const item of communitySignalsFromFeed(sources.homeFeed, now)) {
      if (meta.dismissedSignalIds.includes(item.signalId)) continue;
      if ((meta.snoozedUntil[item.signalId] ?? 0) > now) continue;
      out.push({
        signalId: item.signalId,
        type: 'communities',
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        sourceId: item.communityId,
        destinationRoute: '/community',
        destinationParams: { id: item.communityId },
        read: meta.acknowledgedSignalIds.includes(item.signalId),
        priority: 'normal',
        dismissible: true,
      });
    }
  }

  const cap = quiet ? QUIET_MAX_SIGNALS : MAX_SIGNALS;
  return out.sort((a, b) => b.createdAt - a.createdAt).slice(0, cap);
}

export function hasMeaningfulUnread(signals: ReelyouSignal[]): boolean {
  return signals.some((s) => !s.read);
}

/** Unread signals that still deserve Home Guiding Light — same canonical list as Signal Center. */
export function guidingLightQualifyingSignals(signals: readonly ReelyouSignal[]): ReelyouSignal[] {
  return signals.filter((signal) => !signal.read);
}

export function shouldShowHomeGuidingLight(signals: readonly ReelyouSignal[]): boolean {
  return guidingLightQualifyingSignals(signals).length > 0;
}
