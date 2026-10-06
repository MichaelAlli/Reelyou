import { memo, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { SkywriteLibraryMediaCard } from '@/components/skywrite/SkywriteLibraryMediaCard';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import { ProfileSkywritingsCopy } from '@/constants/profileSkywritingsCopy';
import { useSessionUserId } from '@/auth/useSessionUserId';
import { useOnboarding } from '@/onboarding';
import type { ProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import { ProfileSkyAreaShortcutsSheet } from '@/components/profile/owner/ProfileSkyAreaShortcutsSheet';
import {
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  SKY_AREA_TAB_ALL,
  type SkyAreaCategoryId,
  type SkyAreaTabId,
} from '@/skyAreas/skyAreaCategory';
import { filterProfileSkywritingItems } from '@/profile/buildProfileSkywritingsSection';
import { useApplySkywriteContentDeletion } from '@/skywrite/lifecycle/useApplySkywriteContentDeletion';
import { openSkywriteMediaPlay } from '@/skywrite/play/openSkywriteMediaPlay';

interface OwnerProfileSkywritingsCardProps {
  section: ProfileSkywritingsSection;
  profileSkyAreaShortcutIds?: readonly SkyAreaCategoryId[];
  onExplorePress?: () => void;
  onItemPress?: (skywriteId: string) => void;
}

function OwnerProfileSkywritingsCardComponent({
  section,
  profileSkyAreaShortcutIds = PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  onExplorePress,
  onItemPress,
}: OwnerProfileSkywritingsCardProps) {
  const [selectedTabId, setSelectedTabId] = useState<SkyAreaTabId>(SKY_AREA_TAB_ALL);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const router = useRouter();
  const { skywrites, setProfileSkyAreaShortcutIds } = useOnboarding();
  const { userId: sessionOwnerId } = useSessionUserId();
  const applyDeletion = useApplySkywriteContentDeletion();
  const skywriteById = useMemo(
    () => new Map(skywrites.map((entry) => [entry.id, entry])),
    [skywrites],
  );
  const isVisitor = section.viewerMode === 'visitor';
  const previewItems = filterProfileSkywritingItems(section.items, selectedTabId).slice(0, 4);

  useEffect(() => {
    if (selectedTabId === SKY_AREA_TAB_ALL) return;
    if (!section.tabs.some((tab) => tab.id === selectedTabId)) {
      setSelectedTabId(SKY_AREA_TAB_ALL);
    }
  }, [section.tabs, selectedTabId]);

  const header = (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Skywritings</Text>
        <Text style={styles.subtitle}>
          {isVisitor
            ? 'Reflections they have chosen to share.'
            : 'Reflections, questions, and threads you’ve shared.'}
        </Text>
      </View>
      {onExplorePress ? <Text style={styles.chevronExplore}>›</Text> : <Text style={styles.chevron}>⌄</Text>}
    </View>
  );

  return (
    <View style={styles.card}>
      {onExplorePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore Skywritings"
          onPress={onExplorePress}
          style={({ pressed }) => [pressed && styles.headerPressed]}>
          {header}
        </Pressable>
      ) : (
        header
      )}

      <View style={styles.tabBarRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}>
          {section.tabs.map((tab) => {
            const active = tab.id === selectedTabId;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedTabId(tab.id)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {!isVisitor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ProfileSkywritingsCopy.customizeAreasA11y}
            onPress={() => setShortcutsOpen(true)}
            style={styles.shortcutBtn}>
            <Text style={styles.shortcutBtnText}>{ProfileSkywritingsCopy.customizeAreasLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      {previewItems.length > 0 ? (
        <View style={styles.previewList}>
          {previewItems.map((item) => {
            const record = skywriteById.get(item.id);
            if (!record) {
              return (
                <Text key={item.id} style={styles.previewLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              );
            }
            const isOwner =
              Boolean(sessionOwnerId) &&
              (record.authorId === sessionOwnerId || !record.authorId);
            const menuActions =
              !isVisitor && isOwner
                ? [
                    {
                      id: 'edit',
                      label: ProfileSkywritingsCopy.editPost,
                      onPress: () =>
                        router.push(`/skywrite/compose?editId=${record.id}` as never),
                    },
                    {
                      id: 'delete',
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
                              onPress: () =>
                                applyDeletion({
                                  ...record,
                                  authorId: record.authorId ?? sessionOwnerId ?? '',
                                }),
                            },
                          ],
                        );
                      },
                    },
                  ]
                : undefined;

            return (
              <SkywriteLibraryMediaCard
                key={item.id}
                skywrite={record}
                caption={item.label}
                menuActions={menuActions}
                onPressMedia={() => {
                  if (onItemPress) {
                    onItemPress(item.id);
                    return;
                  }
                  if (!isVisitor) {
                    openSkywriteMediaPlay(router, record, { autoplay: true });
                  }
                }}
                style={styles.mediaCard}
              />
            );
          })}
        </View>
      ) : isVisitor ? (
        <Text style={styles.emptyHint}>No shared Skywrites in this view yet.</Text>
      ) : null}

      {!isVisitor ? (
        <ProfileSkyAreaShortcutsSheet
          visible={shortcutsOpen}
          selectedIds={profileSkyAreaShortcutIds}
          onClose={() => setShortcutsOpen(false)}
          onSave={(ids) => setProfileSkyAreaShortcutIds(ids)}
        />
      ) : null}
    </View>
  );
}

export const OwnerProfileSkywritingsCard = memo(OwnerProfileSkywritingsCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: OWNER_PROFILE_SECTION_GAP,
    marginBottom: 4,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 8,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(248, 244, 236, 0.55)',
    marginTop: 2,
  },
  chevronExplore: {
    fontSize: 22,
    color: 'rgba(232, 200, 114, 0.75)',
    marginTop: 2,
  },
  headerPressed: { opacity: 0.92 },
  previewList: { marginTop: 10, gap: 14 },
  mediaCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    padding: 8,
    backgroundColor: 'rgba(6, 8, 22, 0.35)',
  },
  previewLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(248, 244, 236, 0.88)',
  },
  emptyHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.55)',
    marginTop: 8,
    marginBottom: 4,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabRow: {
    gap: 7,
    paddingBottom: 0,
    paddingRight: 2,
    flexGrow: 1,
  },
  shortcutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
  },
  shortcutBtnText: {
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
  },
  tabActive: {
    borderColor: 'rgba(232, 200, 114, 0.48)',
    backgroundColor: 'rgba(232, 200, 114, 0.16)',
    shadowColor: '#E8C872',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  tabLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.68)',
  },
  tabLabelActive: {
    color: '#FFF8F0',
  },
});
