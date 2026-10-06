import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { useTransientToast } from '@/components/ui/TransientToast';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { savedThreadsPublicUiEnabled } from '@/constants/betaFeatures';
import { ProfileSkywritingsCopy } from '@/constants/profileSkywritingsCopy';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { SavedThreadsCopy } from '@/constants/savedThreadsCopy';
import { Fonts, Radius } from '@/constants/theme';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useOnboarding } from '@/onboarding';
import {
  buildArchivedSavedThreadLibraryRows,
  buildAuthoredLibraryRows,
  buildContributedLibraryRows,
  buildYourJourneyLibraryRows,
  buildSavedThreadLibraryRows,
  type MySkywriteLibraryRow,
  type MySkywritesTabId,
} from '@/skywrite/library/buildMySkywritesLibrary';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { SkywriteLibraryMediaCard } from '@/components/skywrite/SkywriteLibraryMediaCard';
import { SkywriteVideoCoverSheet } from '@/components/skywrite/SkywriteVideoCoverSheet';
import { skywriteHasVideoMedia } from '@/skywrite/media/getSkywriteThumbnail';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';
import { useApplySkywriteContentDeletion } from '@/skywrite/lifecycle/useApplySkywriteContentDeletion';
import { usePlaySkySequenceRegistry } from '@/skywrite/play/usePlaySkySequenceRegistry';
import { openSkywritePostView } from '@/skywrite/openSkywritePostView';

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
  const { user: authUser } = useReelyouAuth();
  const ownerUserId = resolveActiveUserId(authUser);
  const { skywrites, addSkywriteToYourJourney, applySkywriteVideoCoverAt } = useOnboarding();
  const { library, archiveSkywrite, restoreSkywrite } = useSkywriteLibrary();
  const { threadState, contributions } = useSkywriteThreads();
  const { state: savedThreadsState, archiveThread, restoreThread } = useSavedThreads();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const [tab, setTab] = useState<MySkywritesTabId>('recent');
  const [query, setQuery] = useState('');
  const audioPreview = useOverlayAudioPreviewScope(visible);
  const applyDeletion = useApplySkywriteContentDeletion();
  const { repostToSkyreel } = usePlaySkySequenceRegistry();
  const { show: showToast, Toast: repostToast } = useTransientToast();
  const [repostPendingId, setRepostPendingId] = useState<string | null>(null);
  const [coverEditRecord, setCoverEditRecord] = useState<MySkywriteLibraryRow['skywrite'] | null>(
    null,
  );
  const showSavedThreadsTab = savedThreadsPublicUiEnabled();

  const handleRepostToSkyreel = useCallback(
    (skywriteId: string, skywrite: MySkywriteLibraryRow['skywrite']) => {
      if (repostPendingId === skywriteId) return;
      setRepostPendingId(skywriteId);
      showToast(MySkywritesCopy.repostSkyreelPending);
      void repostToSkyreel(skywriteId, skywrite).then((result) => {
        setRepostPendingId((current) => (current === skywriteId ? null : current));
        if (result.ok) {
          showToast(MySkywritesCopy.repostSkyreelSuccess);
        } else {
          showToast(MySkywritesCopy.repostSkyreelFailed);
        }
      });
    },
    [repostPendingId, repostToSkyreel, showToast],
  );

  const rows = useMemo(() => {
    if (tab === 'contributed') {
      return buildContributedLibraryRows({
        localPosts: skywrites,
        library,
        responses: threadState.responses,
        contributions,
        blockedUserIds: messages.blockedUserIds,
        followGraph: skyFollowGraph,
        ownerUserId: ownerUserId || undefined,
        query,
      });
    }
    if (tab === 'journey') {
      return buildYourJourneyLibraryRows({
        localPosts: skywrites,
        library,
        query,
        ownerUserId: ownerUserId || undefined,
      });
    }
    if (tab === 'saved') {
      return buildSavedThreadLibraryRows({
        localPosts: skywrites,
        library,
        saved: savedThreadsState,
        contributions,
        blockedUserIds: messages.blockedUserIds,
        ownerUserId: ownerUserId || undefined,
        query,
      });
    }
    if (tab === 'archived') {
      const authored = buildAuthoredLibraryRows({
        localPosts: skywrites,
        library,
        tab: 'archived',
        query,
        ownerUserId: ownerUserId || undefined,
      });
      if (!showSavedThreadsTab) return authored;
      return [
        ...authored,
        ...buildArchivedSavedThreadLibraryRows({
          localPosts: skywrites,
          library,
          saved: savedThreadsState,
          contributions,
          blockedUserIds: messages.blockedUserIds,
          ownerUserId: ownerUserId || undefined,
          query,
        }),
      ].sort((a, b) => b.sortMs - a.sortMs);
    }
    return buildAuthoredLibraryRows({
      localPosts: skywrites,
      library,
      tab: 'recent',
      query,
      ownerUserId: ownerUserId || undefined,
    });
  }, [
    contributions,
    library,
    messages.blockedUserIds,
    ownerUserId,
    skyFollowGraph,
    query,
    savedThreadsState,
    skywrites,
    showSavedThreadsTab,
    tab,
    threadState.responses,
  ]);

  useEffect(() => {
    if (!showSavedThreadsTab && tab === 'saved') {
      setTab('recent');
    }
  }, [showSavedThreadsTab, tab]);

  const emptyCopy =
    tab === 'archived'
      ? MySkywritesCopy.emptyArchived
      : tab === 'journey'
        ? MySkywritesCopy.emptyYourJourney
        : tab === 'saved'
          ? MySkywritesCopy.emptySaved
          : tab === 'contributed'
            ? MySkywritesCopy.emptyContributed
            : MySkywritesCopy.emptyRecent;

  const openMedia = useCallback(
    (row: MySkywriteLibraryRow) => {
      void audioPreview.stopAll();
      onClose();
      if (row.savedThreadId) {
        InteractionManager.runAfterInteractions(() => {
          router.push(`/skywrite/saved/${row.savedThreadId}` as never);
        });
        return;
      }
      const post = row.skywrite;
      InteractionManager.runAfterInteractions(() => {
        openSkywritePostView(router, post);
      });
    },
    [audioPreview, onClose, router],
  );

  const handleClose = useCallback(() => {
    void audioPreview.stopAll();
    onClose();
  }, [audioPreview, onClose]);

  const tabs: { id: MySkywritesTabId; label: string }[] = useMemo(() => {
    const all: { id: MySkywritesTabId; label: string }[] = [
      { id: 'recent', label: MySkywritesCopy.tabRecent },
      { id: 'journey', label: MySkywritesCopy.tabYourJourney },
      { id: 'saved', label: MySkywritesCopy.tabSavedThreads },
      { id: 'archived', label: MySkywritesCopy.tabArchived },
      { id: 'contributed', label: MySkywritesCopy.tabContributed },
    ];
    return showSavedThreadsTab ? all : all.filter((entry) => entry.id !== 'saved');
  }, [showSavedThreadsTab]);

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

        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={[
            styles.listContent,
            (tab === 'recent' || tab === 'journey') && styles.gridListContent,
          ]}>
          {rows.length === 0 ? (
            <Text style={styles.empty}>{emptyCopy}</Text>
          ) : (
            rows.map((row) => {
              const isOwner = row.skywrite.authorId === ownerUserId;
              const menuActions = [];
              if (row.savedThreadId && (tab === 'saved' || tab === 'archived')) {
                menuActions.push({
                  id: 'saved-thread-archive',
                  label:
                    tab === 'archived'
                      ? SavedThreadsCopy.restoreSaved
                      : SavedThreadsCopy.archiveSaved,
                  onPress: () =>
                    tab === 'archived'
                      ? restoreThread(row.savedThreadId!)
                      : archiveThread(row.savedThreadId!),
                });
              } else if (isOwner && tab !== 'contributed' && tab !== 'saved') {
                if (tab === 'recent' || tab === 'journey') {
                  menuActions.push({
                    id: 'repost-play-sky',
                    label: MySkywritesCopy.repostPlaySky,
                    onPress: () => handleRepostToSkyreel(row.skywriteId, row.skywrite),
                  });
                  if (skywriteHasVideoMedia(row.skywrite)) {
                    menuActions.push({
                      id: 'edit-cover',
                      label: MySkywritesCopy.editCover,
                      onPress: () => setCoverEditRecord(row.skywrite),
                    });
                  }
                }
                if (tab === 'recent' && !row.inYourJourney) {
                  menuActions.push({
                    id: 'add-to-journey',
                    label: MySkywritesCopy.addToYourJourney,
                    onPress: () => {
                      void addSkywriteToYourJourney(row.skywriteId).then((result) => {
                        if (result.ok) {
                          Alert.alert('Your Journey', MySkywritesCopy.journeyAddedSuccess);
                        }
                      });
                    },
                  });
                }
                if (tab === 'recent' || tab === 'journey') {
                  menuActions.push({
                    id: 'edit-skywrite',
                    label: ProfileSkywritingsCopy.editPost,
                    onPress: () => {
                      void audioPreview.stopAll();
                      onClose();
                      router.push(`/skywrite/compose?editId=${row.skywriteId}` as never);
                    },
                  });
                  menuActions.push({
                    id: 'delete-skywrite',
                    label: ProfileSkywritingsCopy.deletePost,
                    onPress: () => {
                      Alert.alert(
                        ProfileSkywritingsCopy.deleteConfirmTitle,
                        ProfileSkywritingsCopy.deleteConfirmBody,
                        [
                          { text: ProfileSkywritingsCopy.deleteCancel, style: 'cancel' },
                          {
                            text: ProfileSkywritingsCopy.deleteConfirmAction,
                            style: 'destructive',
                            onPress: () => applyDeletion(row.skywrite),
                          },
                        ],
                      );
                    },
                  });
                }
                menuActions.push({
                  id: 'archive-skywrite',
                  label:
                    tab === 'archived'
                      ? MySkywritesCopy.restoreAction
                      : MySkywritesCopy.archiveAction,
                  onPress: () =>
                    tab === 'archived'
                      ? restoreSkywrite(row.skywriteId)
                      : archiveSkywrite(row.skywriteId),
                });
              }

              return (
                <SkywriteLibraryMediaCard
                  key={`${row.savedThreadId ?? row.skywriteId}-${row.contributedResponseId ?? 'owned'}`}
                  skywrite={row.skywrite}
                  caption={row.excerpt}
                  dateLabel={formatWhen(row.sortMs)}
                  menuActions={menuActions}
                  onPressMedia={() => openMedia(row)}
                  onToggleAudio={(previewId, uri) => void audioPreview.togglePreview(previewId, uri)}
                  isAudioPlaying={(previewId) => audioPreview.isPreviewPlaying(previewId)}
                  getAudioPreviewProgress={(previewId) =>
                    audioPreview.getPreviewProgress(previewId)
                  }
                  compactGrid={tab === 'recent' || tab === 'journey'}
                  style={[
                    styles.mediaCard,
                    (tab === 'recent' || tab === 'journey') && styles.gridMediaCard,
                  ]}
                />
              );
            })
          )}
        </ScrollView>

        <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityLabel={MySkywritesCopy.close}>
          <Text style={styles.closeText}>{MySkywritesCopy.close}</Text>
        </Pressable>
        {repostToast}
        <SkywriteVideoCoverSheet
          visible={Boolean(coverEditRecord)}
          record={coverEditRecord}
          onClose={() => setCoverEditRecord(null)}
          onSave={async (seekMs) => {
            if (!coverEditRecord) return false;
            const result = await applySkywriteVideoCoverAt(coverEditRecord.id, seekMs);
            if (result.ok) {
              showToast(MySkywritesCopy.editCoverSaved);
              return true;
            }
            showToast(MySkywritesCopy.editCoverFailed);
            return false;
          }}
        />
      </View>
    </CalmOverlaySheet>
  );
}

export const MySkywritesSheet = memo(MySkywritesSheetComponent);

const styles = StyleSheet.create({
  panel: {
    position: 'relative',
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
  listScroll: { maxHeight: 420 },
  listContent: { gap: 16, paddingBottom: 8 },
  gridListContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  mediaCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    padding: 10,
    backgroundColor: 'rgba(6, 8, 22, 0.35)',
  },
  gridMediaCard: {
    width: '31%',
    minWidth: 108,
    flexGrow: 1,
    padding: 6,
  },
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
