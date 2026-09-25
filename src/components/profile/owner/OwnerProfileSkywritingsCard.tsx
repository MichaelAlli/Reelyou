import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import type { ProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import { SKY_AREA_TAB_ALL, type SkyAreaTabId } from '@/skyAreas/skyAreaCategory';
import { filterProfileSkywritingItems } from '@/profile/buildProfileSkywritingsSection';

interface OwnerProfileSkywritingsCardProps {
  section: ProfileSkywritingsSection;
  onExplorePress?: () => void;
  onItemPress?: (skywriteId: string) => void;
}

function OwnerProfileSkywritingsCardComponent({
  section,
  onExplorePress,
  onItemPress,
}: OwnerProfileSkywritingsCardProps) {
  const [selectedTabId, setSelectedTabId] = useState<SkyAreaTabId>(SKY_AREA_TAB_ALL);
  const router = useRouter();
  const isVisitor = section.viewerMode === 'visitor';
  const previewItems = filterProfileSkywritingItems(section.items, selectedTabId).slice(0, 4);

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

      {previewItems.length > 0 ? (
        <View style={styles.previewList}>
          {previewItems.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => {
                if (onItemPress) {
                  onItemPress(item.id);
                  return;
                }
                if (!isVisitor) {
                  router.push(`/skywrite/${item.id}` as never);
                }
              }}
              style={({ pressed }) => [styles.previewRow, pressed && styles.previewRowPressed]}>
              <Text style={styles.previewLabel} numberOfLines={1}>
                {item.label}
              </Text>
              {(onItemPress || !isVisitor) ? <Text style={styles.previewChevron}>›</Text> : null}
            </Pressable>
          ))}
        </View>
      ) : isVisitor ? (
        <Text style={styles.emptyHint}>No shared Skywrites in this view yet.</Text>
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
  previewList: { marginTop: 10, gap: 6 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 8,
  },
  previewRowPressed: { opacity: 0.9 },
  previewLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(248, 244, 236, 0.88)',
  },
  previewChevron: { fontSize: 18, color: 'rgba(232, 200, 114, 0.65)' },
  emptyHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.55)',
    marginTop: 8,
    marginBottom: 4,
  },
  tabRow: {
    gap: 7,
    paddingBottom: 0,
    paddingRight: 2,
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
