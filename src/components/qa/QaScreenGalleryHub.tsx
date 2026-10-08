import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemeModeDevControl } from '@/components/dev/ThemeModeDevControl';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { isQaPreviewFeatureEnabled } from '@/config/qaPreviewFlags';
import { Fonts } from '@/constants/theme';
import {
  groupQaPreviewTargets,
  QA_PREVIEW_SECTION_LABELS,
  withQaPreviewHref,
} from '@/qa/qaPreviewRoutes';
import { spacing } from '@/theme';

export function QaScreenGalleryHub() {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const groups = useMemo(() => groupQaPreviewTargets(filter), [filter]);

  return (
    <ScreenContainer scroll contentStyle={styles.container}>
      <Text style={styles.badge}>INTERNAL · QA SCREEN GALLERY</Text>
      <Text style={styles.title}>Screen preview</Text>
      <Text style={styles.note}>
        Tap a route to open the real screen with ?qaPreview=1 (read-only guards, no emails/resets).
        Not linked in production navigation. Flag: EXPO_PUBLIC_ENABLE_QA_PREVIEW
        {isQaPreviewFeatureEnabled() ? ' (on)' : ' (off)'}.
      </Text>

      <View style={styles.themePanel}>
        <ThemeModeDevControl embedded allowInternalQa />
      </View>

      <TextInput
        accessibilityLabel="Search screens"
        placeholder="Search screens…"
        placeholderTextColor="rgba(248,249,252,0.45)"
        value={filter}
        onChangeText={setFilter}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {groups.map(({ section, targets }) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{QA_PREVIEW_SECTION_LABELS[section]}</Text>
          {targets.map((target) => (
            <Pressable
              key={target.id}
              accessibilityRole="button"
              accessibilityLabel={`Preview ${target.label}`}
              onPress={() => router.push(withQaPreviewHref(target.href) as never)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{target.label}</Text>
                <Text style={styles.description}>{target.description}</Text>
                <Text style={styles.route}>{withQaPreviewHref(target.href)}</Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.Spacing24,
    paddingBottom: spacing.Spacing32,
    gap: spacing.Spacing12,
    backgroundColor: '#050818',
  },
  badge: {
    alignSelf: 'center',
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#D4AF37',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    color: '#F8F9FC',
    textAlign: 'center',
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248, 249, 252, 0.62)',
    textAlign: 'center',
  },
  themePanel: {
    width: '100%',
    marginTop: spacing.Spacing4,
  },
  search: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#F8F9FC',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    paddingHorizontal: spacing.Spacing16,
    paddingVertical: spacing.Spacing10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  section: {
    width: '100%',
    gap: spacing.Spacing8,
    marginTop: spacing.Spacing8,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#D4AF37',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: spacing.Spacing16,
    paddingVertical: spacing.Spacing12,
    gap: spacing.Spacing12,
  },
  rowPressed: {
    opacity: 0.82,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#F8F9FC',
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(248, 249, 252, 0.68)',
  },
  route: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(212, 175, 55, 0.85)',
    marginTop: 2,
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
  },
});
