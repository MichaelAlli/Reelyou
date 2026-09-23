import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedThreadSinceThenPanel } from '@/components/skywrite/SavedThreadSinceThenPanel';
import { SkywriteMediaPreview } from '@/components/skywrite/SkywriteMediaPreview';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { SavedThreadsCopy } from '@/constants/savedThreadsCopy';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';
import { useOnboarding } from '@/onboarding';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { resolveSavedThreadSourceAccess } from '@/skywrite/savedThreads/savedThreadAccess';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';
import { useThemedStyles } from '@/theme/useTheme';

function formatWhen(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function SavedThreadDetailScreen() {
  const router = useRouter();
  const { savedThreadId } = useLocalSearchParams<{ savedThreadId?: string }>();
  const { skywrites } = useOnboarding();
  const { messages } = useReelyouConnect();
  const { getResponses, contributions } = useSkywriteThreads();
  const {
    state,
    markVisited,
    addReflection,
    editReflection,
    removeReflection,
    archiveThread,
    restoreThread,
    unsaveThreadById,
    reflectionsFor,
  } = useSavedThreads();
  const { confirmGrowthEvidence } = useHumanPotentialMetrics();
  const { lifecycle } = useSkywriteLibrary();

  const saved = useMemo(
    () => state.savedThreads.find((entry) => entry.savedThreadId === savedThreadId),
    [savedThreadId, state.savedThreads],
  );

  const skywrite = useMemo(
    () => (saved ? resolveSkywriteById(skywrites, saved.skywriteId, lifecycle) : null),
    [lifecycle, saved, skywrites],
  );

  const access = useMemo(
    () =>
      resolveSavedThreadSourceAccess({
        skywrite: skywrite
          ? { ...skywrite, authorId: skywrite.authorId ?? saved!.originalAuthorId }
          : null,
        blockedUserIds: messages.blockedUserIds,
        viewerId: currentUser.id,
      }),
    [messages.blockedUserIds, saved, skywrite],
  );

  const responses = useMemo(
    () => (saved ? getResponses(saved.skywriteId) : []),
    [getResponses, saved],
  );

  const reflections = useMemo(
    () => (savedThreadId ? reflectionsFor(savedThreadId) : []),
    [reflectionsFor, savedThreadId],
  );

  const areaLabel = useMemo(() => {
    const areaId = saved?.skyAreaId ?? skywrite?.skyAreaId;
    if (!areaId) return null;
    if (isSkyAreaCategoryId(areaId)) return getSkyAreaCategory(areaId).label;
    return areaId;
  }, [saved?.skyAreaId, skywrite?.skyAreaId]);

  const authorName = useMemo(() => {
    if (!saved) return null;
    return orbitUsers.find((user) => user.id === saved.originalAuthorId)?.name ?? null;
  }, [saved]);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: { flex: 1 },
      safe: { flex: 1 },
      scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
      back: { minHeight: 44, justifyContent: 'center', marginTop: Spacing.sm },
      backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: tokens.gold },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 22,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: 4,
      },
      meta: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.mutedText, marginBottom: Spacing.md },
      card: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        padding: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
      },
      body: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: tokens.primaryText },
      responseCard: {
        borderRadius: Radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.18)',
        padding: Spacing.sm,
        gap: 4,
        marginTop: 8,
      },
      contributionTag: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
      },
      inaccessible: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
      },
      actionText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: tokens.gold },
      toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.sm },
    }),
  );

  const handleVisit = useCallback(() => {
    if (saved) markVisited(saved.savedThreadId);
  }, [markVisited, saved]);

  useEffect(() => {
    handleVisit();
  }, [handleVisit]);

  const confirmUnsave = useCallback(() => {
    if (!saved) return;
    Alert.alert(SavedThreadsCopy.unsaveConfirmTitle, SavedThreadsCopy.unsaveConfirmBody, [
      {
        text: SavedThreadsCopy.unsaveKeepReflections,
        onPress: () => {
          unsaveThreadById(saved.savedThreadId, false);
          router.back();
        },
      },
      {
        text: SavedThreadsCopy.unsaveRemoveAll,
        style: 'destructive',
        onPress: () => {
          unsaveThreadById(saved.savedThreadId, true);
          router.back();
        },
      },
      { text: SavedThreadsCopy.cancelEdit, style: 'cancel' },
    ]);
  }, [router, saved, unsaveThreadById]);

  if (!saved || saved.ownerUserId !== currentUser.id) {
    return (
      <View style={styles.root}>
        <HomeBackdrop />
        <SafeAreaView style={styles.safe}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{SavedThreadsCopy.detailBack}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{SavedThreadsCopy.detailBack}</Text>
          </Pressable>

          <Text style={styles.title}>{SkywriteCopy.threadResponsesTitle}</Text>
          <Text style={styles.meta}>
            {authorName ? `${authorName}` : 'Saved thread'}
            {areaLabel ? ` · ${areaLabel}` : ''}
            {` · Saved ${formatWhen(saved.savedAt)}`}
          </Text>

          <View style={styles.toolbar}>
            {saved.status === 'active' ? (
              <Pressable onPress={() => archiveThread(saved.savedThreadId)} hitSlop={8}>
                <Text style={styles.actionText}>{SavedThreadsCopy.archiveSaved}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => restoreThread(saved.savedThreadId)} hitSlop={8}>
                <Text style={styles.actionText}>{SavedThreadsCopy.restoreSaved}</Text>
              </Pressable>
            )}
            <Pressable onPress={confirmUnsave} hitSlop={8}>
              <Text style={styles.actionText}>{SavedThreadsCopy.unsaveThread}</Text>
            </Pressable>
          </View>

          {access === 'available' && skywrite ? (
            <View style={styles.card}>
              <SkywriteMediaPreview
                skywrite={skywrite}
                variant="library"
                excerpt={skywrite.text.trim()}
                previewIdPrefix="saved-thread"
              />
              {responses.map((response) => {
                const contribution = contributions.find(
                  (entry) =>
                    entry.sourceResponseId === response.responseId && entry.state === 'active',
                );
                return (
                  <View key={response.responseId} style={styles.responseCard}>
                    <Text style={styles.body}>{response.body}</Text>
                    {contribution ? (
                      <Text style={styles.contributionTag}>{SavedThreadsCopy.contributionMarker}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.inaccessible}>{SavedThreadsCopy.inaccessibleSource}</Text>
              <Text style={styles.inaccessible}>{SavedThreadsCopy.inaccessibleHint}</Text>
            </View>
          )}

          <SavedThreadSinceThenPanel
            saved={saved}
            reflections={reflections}
            sourceSkywriteId={saved.skywriteId}
            onConfirmGrowthEvidence={({ evidenceType, reflection }) =>
              confirmGrowthEvidence({
                evidenceType,
                reflection,
                savedThreadId: saved.savedThreadId,
                sourceSkywriteId: saved.skywriteId,
                sourceThreadId: saved.threadId,
                originalAuthorId: saved.originalAuthorId,
                contributions,
                skyAreaId: saved.skyAreaId ?? undefined,
              })
            }
            onAddGrowthMoment={(input) =>
              addReflection({
                savedThreadId: saved.savedThreadId,
                ...input,
              })
            }
            onEditReflection={editReflection}
            onRemoveReflection={removeReflection}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
