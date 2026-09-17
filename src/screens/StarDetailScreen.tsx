import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  buildStarDetailView,
  findPatternForNode,
  findSkyNodeById,
} from '@/mySky/buildStarDetailView';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function StarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { mySkyView } = useOnboarding();
  const nodeId = typeof id === 'string' ? id : undefined;
  const node = findSkyNodeById(mySkyView.nodes, nodeId);
  const pattern = node ? findPatternForNode(mySkyView.patterns, node.id) : null;
  const detail = node ? buildStarDetailView(node, pattern) : null;

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
      eyebrow: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: tokens.gold,
        marginBottom: 6,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 26,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: 4,
        letterSpacing: -0.2,
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
      rowLabel: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: tokens.gold,
      },
      rowValue: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 22,
        color: tokens.primaryText,
      },
      context: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 22,
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

  const metaParts = detail
    ? [detail.typeLabel, detail.categoryLabel, detail.dateLabel, detail.visibilityLabel].filter(
        Boolean,
      )
    : [];

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={MySkyCopy.starDetailBack}
            onPress={() => router.back()}
            style={styles.back}>
            <Text style={styles.backText}>{MySkyCopy.starDetailBack}</Text>
          </Pressable>

          {detail ? (
            <>
              <Text style={styles.eyebrow}>{MySkyCopy.starDetailEyebrow}</Text>
              <Text style={styles.title}>{detail.title}</Text>
              {metaParts.length > 0 ? (
                <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
              ) : null}

              <View style={styles.card}>
                {detail.patternLabel ? (
                  <>
                    <Text style={styles.rowLabel}>{MySkyCopy.starDetailPatternLabel}</Text>
                    <Text style={styles.rowValue}>{detail.patternLabel}</Text>
                  </>
                ) : null}

                {detail.isSparse ? (
                  <Text style={styles.context}>{MySkyCopy.starDetailSparseBody}</Text>
                ) : detail.context ? (
                  <>
                    {!detail.patternLabel ? (
                      <Text style={styles.rowLabel}>{MySkyCopy.starDetailContextLabel}</Text>
                    ) : null}
                    <Text style={styles.context}>{detail.context}</Text>
                  </>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>{MySkyCopy.starDetailMissingTitle}</Text>
              <Text style={styles.emptyBody}>{MySkyCopy.starDetailMissingBody}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
