import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { SavedThreadsCopy } from '@/constants/savedThreadsCopy';
import { SKYWRITE_VISIBILITY_OPTIONS } from '@/constants/skywriteCopy';
import { Fonts, Radius } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { useOnboarding } from '@/onboarding';
import {
  buildArchivedSavedThreadLibraryRows,
  buildAuthoredLibraryRows,
  buildContributedLibraryRows,
  buildSavedThreadLibraryRows,
  type MySkywritesTabId,
} from '@/skywrite/library/buildMySkywritesLibrary';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { SkywriteMediaPreview } from '@/components/skywrite/SkywriteMediaPreview';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

interface MySkywritesSheetProps {
  visible: boolean;
  onClose: () => void;
}

function formatWhen(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function MySkywritesSheetComponent({ visible, onClose }: MySkywritesSheetProps) {
  const router = useRouter();
  const { skywrites } = useOnboarding();
  const { library, archiveSkywrite, restoreSkywrite } = useSkywriteLibrary();
  const { threadState, contributions } = useSkywriteThreads();
  const { state: savedThreadsState, archiveThread, restoreThread } = useSavedThreads();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const [tab, setTab] = useState<MySkywritesTabId>('recent');
  const [query, setQuery] = useState('');
  const audioPreview = useOverlayAudioPreviewScope(visible);

  const rows = useMemo(() => {
    if (tab === 'contributed') {
      return buildContributedLibraryRows({
        localPosts: skywrites,
        library,
        responses: threadState.responses,
        contributions,
        blockedUserIds: messages.blockedUserIds,
        followGraph: skyFollowGraph,
        query,
      });
    }
    if (tab === 'saved') {
      return buildSavedThreadLibraryRows({
        localPosts: skywrites,
        library,
        saved: savedThreadsState,
        contributions,
        blockedUserIds: messages.blockedUserIds,
        query,
      });
    }
    if (tab === 'archived') {
      return [
        ...buildAuthoredLibraryRows({
          localPosts: skywrites,
          library,
          tab: 'archived',
          query,
        }),
        ...buildArchivedSavedThreadLibraryRows({
          localPosts: skywrites,
          library,
          saved: savedThreadsState,
          contributions,
          blockedUserIds: messages.blockedUserIds,
          query,
        }),
      ].sort((a, b) => b.sortMs - a.sortMs);
    }
    return buildAuthoredLibraryRows({
      localPosts: skywrites,
      library,
      tab: 'recent',
      query,
    });
  }, [
    contributions,
    library,
    messages.blockedUserIds,
    skyFollowGraph,
    query,
    savedThreadsState,
    skywrites,
    tab,
    threadState.responses,
  ]);

  const emptyCopy =
    tab === 'archived'
      ? MySkywritesCopy.emptyArchived
      : tab === 'saved'
        ? MySkywritesCopy.emptySaved
        : tab === 'contributed'
          ? MySkywritesCopy.emptyContributed
          : MySkywritesCopy.emptyRecent;

  const openDetail = useCallback(
    (row: { skywriteId: string; savedThreadId?: string }) => {
      void audioPreview.stopAll();
      onClose();
      if (row.savedThreadId) {
        router.push(`/skywrite/saved/${row.savedThreadId}` as never);
        return;
      }
      router.push(`/skywrite/${row.skywriteId}` as never);
    },
    [audioPreview, onClose, router],
  );

  const handleClose = useCallback(() => {
    void audioPreview.stopAll();
    onClose();
  }, [audioPreview, onClose]);

  const tabs: { id: MySkywritesTabId; label: string }[] = [
    { id: 'recent', label: MySkywritesCopy.tabRecent },
    { id: 'saved', label: MySkywritesCopy.tabSaved },
    { id: 'archived', label: MySkywritesCopy.tabArchived },
    { id: 'contributed', label: MySkywritesCopy.tabContributed },
  ];

  return (
    <CalmOverlaySheet visible={visible} onClose={handleClose} backdropLabel={MySkywritesCopy.close}>
      <View style={styles.panel}>
        <Text style={styles.title}>{MySkywritesCopy.sheetTitle}</Text>
        <Text style={styles.subtitle}>{MySkywritesCopy.sheetSubtitle}</Text>
        <Text style={styles.hint}>{MySkywritesCopy.listHint}</Text>

        <View style={styles.tabRow}>
          {tabs.map((entry) => {
            const active = tab === entry.id;
            return (
              <Pressable
                key={entry.id}
                onPress={() => setTab(entry.id)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{entry.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={MySkywritesCopy.searchPlaceholder}
          placeholderTextColor="rgba(235,228,248,0.42)"
          style={styles.search}
        />

        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
          {rows.length === 0 ? (
            <Text style={styles.empty}>{emptyCopy}</Text>
          ) : (
            rows.map((row) => {
              const visibilityLabel =
                SKYWRITE_VISIBILITY_OPTIONS.find((option) => option.id === row.visibility)?.title ??
                row.visibility;
              const isOwner = row.skywrite.authorId === currentUser.id;
              return (
                <View
                  key={`${row.savedThreadId ?? row.skywriteId}-${row.contributedResponseId ?? 'owned'}`}
                  style={styles.row}>
                  <Pressable
                    style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
                    onPress={() => openDetail(row)}>
                    <SkywriteMediaPreview
                      skywrite={row.skywrite}
                      variant="library"
                      excerpt={row.excerpt}
                      previewIdPrefix="my-skywrites"
                      allowAudioPreview={false}
                    />
                    <View style={styles.rowMeta}>
                      {row.areaLabel ? <Text style={styles.area}>{row.areaLabel}</Text> : null}
                      <Text style={styles.when}>{formatWhen(row.sortMs)}</Text>
                    </View>
                    {row.intentLabel ? <Text style={styles.intent}>{row.intentLabel}</Text> : null}
                    <Text style={styles.visibility}>{visibilityLabel}</Text>
                  </Pressable>
                  {row.savedThreadId && (tab === 'saved' || tab === 'archived') ? (
                    <Pressable
                      onPress={() =>
                        tab === 'archived'
                          ? restoreThread(row.savedThreadId!)
                          : archiveThread(row.savedThreadId!)
                      }
                      hitSlop={8}
                      style={styles.secondaryAction}>
                      <Text style={styles.secondaryActionText}>
                        {tab === 'archived'
                          ? SavedThreadsCopy.restoreSaved
                          : SavedThreadsCopy.archiveSaved}
                      </Text>
                    </Pressable>
                  ) : isOwner && tab !== 'contributed' && tab !== 'saved' ? (
                    <Pressable
                      onPress={() =>
                        tab === 'archived'
                          ? restoreSkywrite(row.skywriteId)
                          : archiveSkywrite(row.skywriteId)
                      }
                      hitSlop={8}
                      style={styles.secondaryAction}>
                      <Text style={styles.secondaryActionText}>
                        {tab === 'archived'
                          ? MySkywritesCopy.restoreAction
                          : MySkywritesCopy.archiveAction}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>

        <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityLabel={MySkywritesCopy.close}>
          <Text style={styles.closeText}>{MySkywritesCopy.close}</Text>
        </Pressable>
      </View>
    </CalmOverlaySheet>
  );
}

export const MySkywritesSheet = memo(MySkywritesSheetComponent);

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    padding: 16,
    maxHeight: '100%',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.72)',
    textAlign: 'center',
    marginTop: 4,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(235,228,248,0.48)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tab: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabActive: {
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
  },
  tabText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235,228,248,0.62)',
  },
  tabTextActive: {
    color: '#E8C872',
  },
  search: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#F5F0FF',
    marginBottom: 10,
  },
  listScroll: { maxHeight: 360 },
  listContent: { gap: 10, paddingBottom: 8 },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(235,228,248,0.58)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    overflow: 'hidden',
  },
  rowMain: { padding: 12, gap: 6 },
  pressed: { opacity: 0.88 },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  area: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
    textTransform: 'uppercase',
  },
  when: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: 'rgba(235,228,248,0.5)',
  },
  intent: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.68)',
  },
  excerpt: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.88)',
  },
  visibility: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: 'rgba(235,228,248,0.45)',
  },
  secondaryAction: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(167, 139, 250, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(232, 200, 114, 0.78)',
  },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
});
