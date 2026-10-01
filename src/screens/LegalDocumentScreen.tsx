import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  isLegalDocumentId,
  LEGAL_DOCUMENT_BODY,
  LEGAL_DOCUMENT_IS_BETA_DRAFT,
  LEGAL_DOCUMENT_TITLES,
  LEGAL_DOCUMENT_UNAVAILABLE_MESSAGE,
  LEGAL_DOCUMENT_VERSION,
} from '@/constants/legalDocuments';
import { LegalDocumentBody } from '@/components/legal/LegalDocumentBody';
import { Fonts, Spacing } from '@/constants/theme';

export function LegalDocumentScreen() {
  const router = useRouter();
  const { document } = useLocalSearchParams<{ document?: string }>();
  const documentId = typeof document === 'string' && isLegalDocumentId(document) ? document : null;
  const title = documentId ? LEGAL_DOCUMENT_TITLES[documentId] : 'Legal';
  const body = documentId ? LEGAL_DOCUMENT_BODY[documentId] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to sign up"
          style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {LEGAL_DOCUMENT_IS_BETA_DRAFT ? (
          <Text style={styles.meta}>Draft {LEGAL_DOCUMENT_VERSION} — counsel review required</Text>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {body ? (
          <LegalDocumentBody body={body} />
        ) : (
          <Text style={styles.body}>{LEGAL_DOCUMENT_UNAVAILABLE_MESSAGE}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  back: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: '#E8C872',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(232,200,114,0.85)',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
  },
});
