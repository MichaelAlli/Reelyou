import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModerationReportSheet } from '@/components/safety/ModerationReportSheet';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { otherParticipantId } from '@/messages/messagesCanonical';
import { Fonts } from '@/constants/theme';

export function MessageThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const router = useRouter();
  const {
    messages: inbox,
    getThreadMessages,
    sendMessage,
    markThreadRead,
    searchableUsers,
    muteThread,
    blockUser,
    limitUser,
    submitModerationReport,
  } = useReelyouConnect();
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const thread = threadId ? inbox.threadsById[threadId] : undefined;

  const messages = useMemo(
    () => (threadId ? getThreadMessages(threadId) : []),
    [getThreadMessages, threadId],
  );

  const otherId = useMemo(() => {
    if (!thread) return null;
    return otherParticipantId(thread.participantIds);
  }, [thread]);

  const otherName = searchableUsers.find((u) => u.id === otherId)?.name ?? 'Connection';

  useEffect(() => {
    if (threadId) markThreadRead(threadId);
  }, [threadId, markThreadRead]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back to inbox">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{otherName}</Text>
        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Thread actions"
          style={styles.menuBtn}
        >
          <Text style={styles.menuIcon}>···</Text>
        </Pressable>
      </View>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.menuSheet}>
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              if (threadId) muteThread(threadId);
              setMenuOpen(false);
            }}
            accessibilityLabel="Mute conversation"
          >
            <Text style={styles.menuRowText}>Mute</Text>
          </Pressable>
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              if (otherId) blockUser(otherId);
              setMenuOpen(false);
              router.back();
            }}
            accessibilityLabel="Block user"
          >
            <Text style={styles.menuRowText}>Block</Text>
          </Pressable>
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              if (!otherId) return;
              setMenuOpen(false);
              setReportOpen(true);
            }}
            accessibilityLabel="Report conversation"
          >
            <Text style={styles.menuRowText}>Report</Text>
          </Pressable>
          <Pressable onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu">
            <Text style={styles.menuClose}>Close</Text>
          </Pressable>
        </View>
      </Modal>
      {otherId && threadId ? (
        <ModerationReportSheet
          visible={reportOpen}
          onClose={() => setReportOpen(false)}
          title="Report message"
          reportInput={{
            targetType: 'message',
            targetId: messages[messages.length - 1]?.id ?? threadId,
            targetOwnerUserId: otherId,
            threadId,
            messageId: messages[messages.length - 1]?.id,
            provenanceIds: messages.slice(-3).map((entry) => entry.id),
            visibilityContext: 'direct_message',
          }}
          onSubmit={submitModerationReport}
          followUp={{
            showBlock: true,
            showLimit: true,
            showMuteThread: true,
            onBlock: () => blockUser(otherId),
            onLimit: () => limitUser(otherId),
            onMuteThread: () => muteThread(threadId),
          }}
        />
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.thread} testID="message-thread">
          {messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <View key={m.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message"
            placeholderTextColor="rgba(235,228,248,0.4)"
            accessibilityLabel="Message text"
          />
          <Pressable
            disabled={!draft.trim() || !threadId}
            onPress={() => {
              if (!threadId) return;
              sendMessage(threadId, draft);
              setDraft('');
            }}
            accessibilityLabel="Send message"
            style={({ pressed }) => [styles.send, (!draft.trim() || pressed) && styles.sendDisabled]}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 17 },
  menuBtn: { width: 48, alignItems: 'flex-end', minHeight: 44, justifyContent: 'center' },
  menuIcon: { color: '#E8C872', fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  menuBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2,4,12,0.55)' },
  menuSheet: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: '30%',
    borderRadius: 16,
    backgroundColor: 'rgba(8,10,28,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    padding: 12,
    gap: 4,
  },
  menuRow: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  menuRowText: { fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 15 },
  menuClose: {
    fontFamily: Fonts.sans,
    color: '#E8C872',
    textAlign: 'center',
    paddingVertical: 10,
    fontWeight: '600',
  },
  reportNote: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.6)',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  thread: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: { maxWidth: '82%', padding: 10, borderRadius: 14 },
  mine: { alignSelf: 'flex-end', backgroundColor: 'rgba(232,200,114,0.18)' },
  theirs: { alignSelf: 'flex-start', backgroundColor: 'rgba(167,139,250,0.16)' },
  bubbleText: { fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 14, lineHeight: 19 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(167,139,250,0.15)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    paddingHorizontal: 12,
    color: '#F5F0FF',
    fontFamily: Fonts.sans,
  },
  send: { justifyContent: 'center', paddingHorizontal: 12, minHeight: 44 },
  sendDisabled: { opacity: 0.5 },
  sendText: { fontFamily: Fonts.sans, fontWeight: '700', color: '#E8C872' },
});
