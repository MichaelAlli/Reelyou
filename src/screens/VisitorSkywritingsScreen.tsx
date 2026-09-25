import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { BottomNav } from '@/components/BottomNav';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts, TabBarHeight, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import {
  buildProfileSkywritingsSection,
  filterProfileSkywritingItems,
} from '@/profile/buildProfileSkywritingsSection';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import {
  visitorSkywriteDetailRoute,
} from '@/profile/visitorSkywritingsRoute';
import { isVisitorProfileBlocked } from '@/profile/resolveVisitorProfilePrivacy';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import { getSkyAreaCategory, isSkyAreaCategoryId, SKY_AREA_TAB_ALL } from '@/skyAreas/skyAreaCategory';
import type { SkyAreaTabId } from '@/skyAreas/skyAreaCategory';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';

interface VisitorSkywritingsScreenProps {
  ownerId?: string;
}

export function VisitorSkywritingsScreen({ ownerId }: VisitorSkywritingsScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);
  const { skyFollowGraph, messages } = useReelyouConnect();
  const subjectId = ownerId ?? '';
  const [tabId, setTabId] = useState<SkyAreaTabId>(SKY_AREA_TAB_ALL);

  const blocked = subjectId
    ? isVisitorProfileBlocked(subjectId, messages.blockedUserIds)
    : true;

  const ownerProfile = useMemo(
    () => (subjectId ? resolvePublicSkyOwnerProfile(subjectId, 'none') : null),
    [subjectId],
  );

  const section = useMemo(() => {
    if (!subjectId || blocked) return null;
    const skywrites = resolveOrbitOwnerSkywrites(subjectId);
    return buildProfileSkywritingsSection({
      skywrites,
      viewerMode: 'visitor',
      visitorAccess: {
        viewerId: currentUser.id,
        authorId: subjectId,
        followGraph: skyFollowGraph,
        blockedUserIds: messages.blockedUserIds,
      },
    });
  }, [blocked, messages.blockedUserIds, skyFollowGraph, subjectId]);

  const visibleItems = useMemo(() => {
    if (!section) return [];
    return filterProfileSkywritingItems(section.items, tabId);
  }, [section, tabId]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (subjectId) {
      router.replace(buildVisitorProfileHref(subjectId) as never);
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router, subjectId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  if (!subjectId || blocked || !ownerProfile || !section) {
    return (
      <View style={styles.root}>
        <ImageBackground source={profileOwnerCelestialBackground} style={StyleSheet.absoluteFill} />
        <View style={[styles.unavailableWrap, { paddingBottom: navInset }]}>
          <Text style={styles.unavailable}>Profile unavailable.</Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ImageBackground source={profileOwnerCelestialBackground} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: navInset }]}
        showsVerticalScrollIndicator={false}>
        <Pressable onPress={handleBack} style={styles.back} accessibilityRole="button">
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={18}
            tintColor="#D4AF37"
            weight="semibold"
          />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Skywritings</Text>
        <Text style={styles.sub}>
          Reflections {ownerProfile.name.split(' ')[0]} has shared with you.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}>
          {section.tabs.map((tab) => {
            const active = tab.id === tabId;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setTabId(tab.id)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing to show here yet</Text>
            <Text style={styles.emptyBody}>
              Skywrites in this category may be private or not shared with your connection.
            </Text>
          </View>
        ) : (
          visibleItems.map((item) => {
            const record = resolveOrbitOwnerSkywrites(subjectId).find((sw) => sw.id === item.id);
            const canOpen =
              record &&
              resolveSkywriteViewerAccess({
                viewerId: currentUser.id,
                authorId: subjectId,
                visibility: record.visibility,
                followGraph: skyFollowGraph,
                blockedUserIds: messages.blockedUserIds,
              });
            const areaLabel =
              record?.skyAreaId && isSkyAreaCategoryId(record.skyAreaId)
                ? getSkyAreaCategory(record.skyAreaId).label
                : null;
            return (
              <Pressable
                key={item.id}
                disabled={!canOpen}
                onPress={() =>
                  router.push(visitorSkywriteDetailRoute(item.id, subjectId) as never)
                }
                style={({ pressed }) => [styles.row, pressed && canOpen && styles.rowPressed]}>
                <View style={styles.rowText}>
                  <Text style={styles.preview} numberOfLines={2}>
                    {record?.text?.trim() || item.label}
                  </Text>
                  {areaLabel ? <Text style={styles.meta}>{areaLabel}</Text> : null}
                </View>
                {canOpen ? <Text style={styles.chevron}>›</Text> : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  scroll: { paddingHorizontal: OWNER_PROFILE_HORIZONTAL_INSET, paddingTop: Spacing.sm },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  backText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#D4AF37' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 4,
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.72)',
    marginBottom: Spacing.md,
  },
  tabRow: { gap: 7, marginBottom: Spacing.md },
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
  },
  tabLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.68)',
  },
  tabLabelActive: { color: '#FFF8F0' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  rowPressed: { opacity: 0.92 },
  rowText: { flex: 1, gap: 4 },
  preview: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFF8F0',
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.85)',
    letterSpacing: 0.3,
  },
  chevron: { fontSize: 22, color: 'rgba(232, 200, 114, 0.75)' },
  emptyCard: {
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    padding: Spacing.lg,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
    gap: 8,
  },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: 18, color: '#FFF8F0' },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.68)',
  },
  unavailableWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.72)',
  },
});
