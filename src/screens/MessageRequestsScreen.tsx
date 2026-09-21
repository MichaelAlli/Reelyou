import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { Fonts } from '@/constants/theme';

export function MessageRequestsScreen() {
  const router = useRouter();
  const {
    messages,
    messageRequestsEnabled,
    searchableUsers,
    preferences,
    acceptMessageRequest,
    declineMessageRequest,
    blockUser,
    reportUser,
  } = useReelyouConnect();

  if (!messageRequestsEnabled) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back">
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Message Requests</Text>
          <View style={styles.spacer} />
        </View>
        <Text style={styles.empty}>Message requests are off in your messaging settings.</Text>
      </SafeAreaView>
    );
  }

  const requests = messages.messageRequests.filter(
    (r) => !messages.blockedUserIds.includes(r.fromUserId),
  );

  const showPreview = preferences.signalPreferences.showMessagePreview;

  return (
    <SafeAreaView style={styles.root} edges={['top']} testID="message-requests-screen">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Message Requests</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {requests.length === 0 ? (
          <Text style={styles.empty}>No pending requests.</Text>
        ) : (
          requests.map((req) => {
            const user = searchableUsers.find((u) => u.id === req.fromUserId);
            return (
              <View key={req.threadId} style={styles.card}>
                <View style={styles.rowTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.initials}>{user?.avatarInitials ?? '?'}</Text>
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name}>{user?.name ?? 'Someone'}</Text>
                    <Text style={styles.preview} numberOfLines={2}>
                      {showPreview ? req.previewText : 'New message request'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.accept}
                    onPress={() => {
                      acceptMessageRequest(req.threadId);
                      router.push(`/messages/${req.threadId}` as never);
                    }}
                    accessibilityLabel={`Accept message from ${user?.name ?? 'requester'}`}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => declineMessageRequest(req.threadId)}
                    accessibilityLabel="Decline request"
                  >
                    <Text style={styles.secondaryText}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => blockUser(req.fromUserId)}
                    accessibilityLabel="Block user"
                  >
                    <Text style={styles.secondaryText}>Block</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() =>
                      void reportUser({
                        reportedUserId: req.fromUserId,
                        threadId: req.threadId,
                        reason: 'other',
                      })
                    }
                    accessibilityLabel="Report user"
                  >
                    <Text style={styles.secondaryText}>Report</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 18 },
  spacer: { width: 48 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  empty: { fontFamily: Fonts.sans, color: 'rgba(235,228,248,0.65)', textAlign: 'center', marginTop: 32 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.22)',
    backgroundColor: 'rgba(8,10,28,0.75)',
    padding: 14,
    gap: 12,
  },
  rowTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(167,139,250,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: Fonts.sans, fontWeight: '700', color: '#F5F0FF' },
  body: { flex: 1 },
  name: { fontFamily: Fonts.sans, fontWeight: '600', color: '#F5F0FF' },
  preview: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.7)', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accept: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(232,200,114,0.22)',
    minHeight: 44,
    justifyContent: 'center',
  },
  acceptText: { fontFamily: Fonts.sans, fontWeight: '700', color: '#E8C872' },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.25)',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.85)' },
});
