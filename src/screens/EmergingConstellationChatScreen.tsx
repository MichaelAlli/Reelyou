import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { currentUser } from '@/data/mockData';
import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { messagesByCommunity, sendMessage, membershipFor } = useEmergingConstellations();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | undefined>();

  const constellation = useMemo(() => {
    const dev = devEmergingConstellationIfEligible();
    if (!dev || (id && dev.id !== id)) return null;
    return dev;
  }, [id]);

  const membership = constellation ? membershipFor(constellation.id) : undefined;
  const messages = constellation ? messagesByCommunity[constellation.id] ?? [] : [];

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleSend = useCallback(() => {
    if (!constellation || membership?.status !== 'joined') return;
    sendMessage(constellation.id, draft, replyTo);
    setDraft('');
    setReplyTo(undefined);
  }, [constellation, draft, membership?.status, replyTo, sendMessage]);

  if (!constellation || membership?.status !== 'joined') {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>Conversation unavailable.</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>General conversation</Text>
          <ScrollView
            style={styles.messages}
            contentContainerStyle={{ paddingBottom: tabInset + 72 }}
            keyboardShouldPersistTaps="handled">
            {messages.length === 0 ? (
              <Text style={styles.empty}>Be the first to share — gently and honestly.</Text>
            ) : (
              messages.map((message) => (
                <View key={message.id} style={styles.bubbleWrap}>
                  <Text style={styles.author}>
                    {message.authorUserId === currentUser.id ? 'You' : 'Member'}
                  </Text>
                  <Text style={styles.bubble}>{message.body}</Text>
                  <Pressable onPress={() => setReplyTo(message.id)}>
                    <Text style={styles.reply}>Reply</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
          {replyTo ? (
            <Text style={styles.replying}>Replying to a message</Text>
          ) : null}
          <View style={[styles.composer, { marginBottom: tabInset }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Share with care..."
              placeholderTextColor="rgba(248,244,236,0.4)"
              style={styles.input}
              multiline
            />
            <Pressable onPress={handleSend} style={styles.send}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  flex: { flex: 1 },
  safe: { flex: 1 },
  back: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
  },
  messages: { flex: 1, paddingHorizontal: Spacing.lg },
  empty: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(248,244,236,0.6)', marginTop: 12 },
  bubbleWrap: { marginBottom: 12 },
  author: { fontFamily: Fonts.sans, fontSize: 10, color: 'rgba(248,244,236,0.45)' },
  bubble: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: '#FFF8F0',
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    padding: 10,
    borderRadius: 12,
    marginTop: 2,
  },
  reply: { fontFamily: Fonts.sans, fontSize: 11, color: '#C4B5FD', marginTop: 4 },
  replying: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: '#E8C872',
    paddingHorizontal: Spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(232,200,114,0.2)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
    paddingVertical: 10,
  },
  send: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sendText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: '#E8C872' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
