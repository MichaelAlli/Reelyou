import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { GuidingLightCopy } from '@/constants/guidingLightCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';

const STARTER_PROMPTS = [
  "What's on your mind?",
  'What should I pay attention to right now?',
  'Help me think through my next step.',
] as const;

/** Premium reflective Guide space — conversational, not a context dump. */
export function CompanionScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState('');
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#060818', '#0A1028', '#05070A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={GuidingLightCopy.companionBack}
              onPress={() => router.back()}
              style={styles.backBtn}>
              <Text style={styles.backText}>{GuidingLightCopy.companionBack}</Text>
            </Pressable>
            <HomeHeaderLogo />
            <View style={styles.backBtn} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{GuidingLightCopy.companionTitle}</Text>
            <Text style={styles.subtitle}>{GuidingLightCopy.companionSubtitle}</Text>
            <Text style={styles.privacyLine}>{GuidingLightCopy.companionPrivacyLine}</Text>

            <View style={styles.promptWrap}>
              {STARTER_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  onPress={() => setDraft(prompt)}
                  style={styles.promptChip}>
                  <Text style={styles.promptText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={GuidingLightCopy.companionInputPlaceholder}
              placeholderTextColor="rgba(235, 228, 248, 0.42)"
              style={styles.input}
              multiline
            />
            <Pressable accessibilityRole="button" style={styles.sendBtn}>
              <Text style={styles.sendText}>{GuidingLightCopy.companionSendLabel}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: { minWidth: 72, minHeight: 44, justifyContent: 'center' },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#E8C872',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: '#FFF8F0',
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(235, 228, 248, 0.78)',
  },
  privacyLine: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(232, 200, 114, 0.78)',
    marginTop: 4,
  },
  permissionsLink: { paddingVertical: 6, alignSelf: 'flex-start' },
  permissionsText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.65)',
    textDecorationLine: 'underline',
  },
  permissionsBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(235, 228, 248, 0.72)',
    marginBottom: Spacing.sm,
  },
  promptWrap: { gap: 8, marginTop: Spacing.md },
  promptChip: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(8, 10, 26, 0.55)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  promptText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(245, 240, 255, 0.88)',
  },
  guidePresence: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    gap: 10,
  },
  orb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 213, 122, 0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  guideHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.62)',
    textAlign: 'center',
    maxWidth: 280,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(232, 200, 114, 0.18)',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.32)',
    backgroundColor: 'rgba(6, 8, 22, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
  },
  sendBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sendText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
});
