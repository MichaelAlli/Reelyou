import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { otherParticipantId } from '@/messages/messagesCanonical';
import { Fonts } from '@/constants/theme';

export function MessagesInboxScreen() {
  const router = useRouter();
  const {
    messages,
    searchableUsers,
    inboxThreadIds,
    messageRequestsEnabled,
  } = useReelyouConnect();
  const pendingRequests = messageRequestsEnabled
    ? messages.messageRequests.filter((r) => !messages.blockedUserIds.includes(r.fromUserId))
    : [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Messages</Text>
        <Pressable onPress={() => router.push('/messages/new' as never)} accessibilityLabel="New message">
          <Text style={styles.new}>New</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {messageRequestsEnabled && pendingRequests.length > 0 ? (
          <Pressable
            style={styles.requestsRow}
            onPress={() => router.push('/messages/requests' as never)}
            accessibilityLabel="Message requests"
          >
            <Text style={styles.requestsTitle}>Message Requests</Text>
            <Text style={styles.requestsHint}>{pendingRequests.length} pending</Text>
          </Pressable>
        ) : null}
        {inboxThreadIds.length === 0 ? (
          <Text style={styles.empty}>No messages yet.</Text>
        ) : (
          inboxThreadIds.map((threadId) => {
            const thread = messages.threadsById[threadId];
            if (!thread) return null;
            const otherId = otherParticipantId(thread.participantIds);
            const user = searchableUsers.find((u) => u.id === otherId);
            const preview = thread.latestMessageId
              ? messages.messagesById[thread.latestMessageId]?.text
              : '';
            return (
              <Pressable
                key={threadId}
                style={styles.row}
                onPress={() => router.push(`/messages/${threadId}` as never)}
                accessibilityLabel={`Conversation with ${user?.name ?? 'connection'}`}
              >
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{user?.avatarInitials ?? '?'}</Text>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name}>{user?.name ?? 'Connection'}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {preview || 'Say hello'}
                  </Text>
                </View>
                {messages.mutedThreadIds.includes(threadId) ? (
                  <Text style={styles.mutedLabel} accessibilityLabel="Muted">Muted</Text>
                ) : null}
                {thread.unreadCount > 0 ? (
                  <View style={styles.unreadDot} accessibilityLabel="Unread" />
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { fontFamily: Fonts.serif, fontSize: 18, color: '#F5F0FF' },
  new: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  requestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,200,114,0.35)',
    backgroundColor: 'rgba(232,200,114,0.08)',
    minHeight: 48,
  },
  requestsTitle: { fontFamily: Fonts.sans, fontWeight: '600', color: '#E8C872' },
  requestsHint: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.7)' },
  mutedLabel: { fontFamily: Fonts.sans, fontSize: 10, color: 'rgba(235,228,248,0.5)' },
  empty: { fontFamily: Fonts.sans, color: 'rgba(235,228,248,0.7)', textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.2)',
    backgroundColor: 'rgba(8,10,28,0.7)',
    minHeight: 56,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167,139,250,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: Fonts.sans, fontWeight: '700', color: '#F5F0FF', fontSize: 12 },
  body: { flex: 1, minWidth: 0 },
  name: { fontFamily: Fonts.sans, fontWeight: '600', color: '#F5F0FF' },
  preview: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.65)' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8C872' },
});
