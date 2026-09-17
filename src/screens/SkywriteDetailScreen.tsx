import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { MySkyCopy } from '@/constants/mySkyCopy';
import {
  SKYWRITE_VISIBILITY_OPTIONS,
  SkywriteCopy,
} from '@/constants/skywriteCopy';
import {
  getSkywriteTextStyleLabel,
  getSkywriteWriteInputStyle,
} from '@/constants/skywriteTextStyles';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { findSkywriteById } from '@/mySky/resolveStarNavigation';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

function formatSkywriteDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function SkywriteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { skywrites } = useOnboarding();
  const record = findSkywriteById(skywrites, typeof id === 'string' ? id : undefined);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: {
        flex: 1,
      },
      safe: {
        flex: 1,
      },
      scroll: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
      },
      back: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
        minHeight: 44,
        justifyContent: 'center',
      },
      backText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        color: tokens.gold,
        fontWeight: '600',
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 24,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: 4,
      },
      meta: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: tokens.mutedText,
        marginBottom: Spacing.md,
      },
      card: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.28)',
        backgroundColor: 'rgba(12, 10, 28, 0.55)',
        padding: Spacing.md,
        gap: Spacing.sm,
      },
      body: {
        color: tokens.primaryText,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: tokens.gold,
      },
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
      },
      chip: {
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.25)',
        paddingVertical: 4,
        paddingHorizontal: 10,
      },
      chipText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.secondaryText,
      },
      photo: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: Radius.md,
        marginTop: Spacing.xs,
      },
      mediaNote: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        color: tokens.secondaryText,
      },
      emptyTitle: {
        fontFamily: Fonts.serif,
        fontSize: 20,
        color: tokens.primaryText,
        marginBottom: Spacing.sm,
      },
      emptyBody: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
      },
    }),
  );

  const visibilityLabel =
    SKYWRITE_VISIBILITY_OPTIONS.find((option) => option.id === record?.visibility)?.title ??
    record?.visibility;

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={MySkyCopy.skywriteDetailBack}
            onPress={() => router.back()}
            style={styles.back}>
            <Text style={styles.backText}>{MySkyCopy.skywriteDetailBack}</Text>
          </Pressable>

          {record ? (
            <>
              <Text style={styles.title}>{MySkyCopy.skywriteDetailTitle}</Text>
              <Text style={styles.meta}>
                {formatSkywriteDate(record.createdAt)}
                {visibilityLabel ? ` · ${visibilityLabel}` : ''}
              </Text>

              <View style={styles.card}>
                <Text style={styles.label}>{getSkywriteTextStyleLabel(record.textStyle)}</Text>
                <Text style={[styles.body, getSkywriteWriteInputStyle(record.textStyle)]}>
                  {record.text.trim() || SkywriteCopy.writePlaceholder}
                </Text>

                {record.media.photo?.uri ? (
                  <Image
                    source={{ uri: record.media.photo.uri }}
                    style={styles.photo}
                    contentFit="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : null}

                {record.mediaMode === 'voice' || record.mediaMode === 'photo_voiceover' ? (
                  <Text style={styles.mediaNote}>{SkywriteCopy.voiceNoteTitle} included</Text>
                ) : null}

                {record.userHashtags.length > 0 ? (
                  <View style={styles.chipRow}>
                    {record.userHashtags.map((tag) => (
                      <View key={tag} style={styles.chip}>
                        <Text style={styles.chipText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>{MySkyCopy.skywriteMissingTitle}</Text>
              <Text style={styles.emptyBody}>{MySkyCopy.skywriteMissingBody}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
