import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
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
import {
  buildPublicSkyView,
  resolvePublicSkyConnectionStatus,
} from '@/mySky/buildPublicSkyView';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { isPublicSkyNodeVisible } from '@/mySky/skyPublicVisibility';
import { resolveSkyVisibilitySettingsForOwner } from '@/mySky/skyVisibilitySettings';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function StarDetailScreen() {
  const router = useRouter();
  const { id, ownerId } = useLocalSearchParams<{ id?: string; ownerId?: string }>();
  const { mySkyView, aroundYourSkyFeed } = useOnboarding();
  const nodeId = typeof id === 'string' ? id : undefined;
  const publicOwnerId = typeof ownerId === 'string' ? ownerId : undefined;

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const publicSkyView = useMemo(() => {
    if (!publicOwnerId) return null;
    const connectionStatus = resolvePublicSkyConnectionStatus(
      publicOwnerId,
      connectionActivities.map((entry) => entry.actorId),
    );
    return buildPublicSkyView(publicOwnerId, connectionStatus);
  }, [connectionActivities, publicOwnerId]);

  const sourceView = publicSkyView ?? mySkyView;
  const node = findSkyNodeById(sourceView.nodes, nodeId);
  const visitorVisibilitySettings = useMemo(() => {
    if (!publicOwnerId) return undefined;
    return resolveSkyVisibilitySettingsForOwner(publicOwnerId);
  }, [publicOwnerId]);

  const visibleNode =
    node &&
    (!publicSkyView ||
      isPublicSkyNodeVisible(
        node,
        publicSkyView.skyOwner.connectionStatus ?? 'none',
        visitorVisibilitySettings,
      ))
      ? node
      : null;
  const pattern = visibleNode ? findPatternForNode(sourceView.patterns, visibleNode.id) : null;
  const detail = visibleNode ? buildStarDetailView(visibleNode, pattern) : null;
  const backLabel = publicOwnerId ? MySkyCopy.publicSkyBack : MySkyCopy.starDetailBack;

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
    ? [
        detail.typeLabel,
        detail.categoryLabel,
        detail.dateLabel,
        publicOwnerId ? null : detail.visibilityLabel,
      ].filter(Boolean)
    : [];

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={() => router.back()}
            style={styles.back}>
            <Text style={styles.backText}>{backLabel}</Text>
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
