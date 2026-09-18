import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MySkySearchResultRow } from '@/components/my-sky/MySkySearchResultRow';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import {
  buildSkySearchDiscovery,
  searchResultCount,
  type SearchResultActionKind,
} from '@/mySky/skySearchDiscovery';
import type { SkySearchResult } from '@/mySky/skySearchSources';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkySearchSheetProps {
  visible: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  exploreEnabled: boolean;
  nearbyAnchors?: NearbySkyAnchor[];
  onJumpToSky?: (ownerId: string) => void;
  onViewSky?: (publicSkyId: string) => void;
  resolveAnchorForOwner?: (ownerId: string) => NearbySkyAnchor | null;
}

function MySkySearchSheetComponent({
  visible,
  query,
  onQueryChange,
  onClose,
  exploreEnabled,
  nearbyAnchors = [],
  onJumpToSky,
  onViewSky,
  resolveAnchorForOwner,
}: MySkySearchSheetProps) {
  const router = useRouter();
  const [unavailableId, setUnavailableId] = useState<string | null>(null);
  const { aroundYourSkyFeed, communities } = useOnboarding();

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const groups = useMemo(
    () =>
      buildSkySearchDiscovery(
        query,
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        exploreEnabled,
      ),
    [aroundYourSkyFeed, communities, connectionActivities, exploreEnabled, query],
  );

  const totalResults = searchResultCount(groups);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '82%',
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.28)',
        backgroundColor: 'rgba(8, 8, 24, 0.96)',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
      },
      handle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(167, 139, 250, 0.35)',
        marginVertical: Spacing.sm,
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 20,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      close: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: Spacing.sm,
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.gold,
      },
      input: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        color: tokens.primaryText,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.28)',
        backgroundColor: 'rgba(12, 10, 28, 0.72)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        marginBottom: Spacing.sm,
      },
      list: {
        gap: Spacing.sm,
        paddingBottom: Spacing.sm,
      },
      group: {
        gap: 6,
      },
      groupTitle: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        color: tokens.mutedText,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginTop: 4,
        marginBottom: 2,
        paddingHorizontal: 2,
      },
      empty: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.mutedText,
        textAlign: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
      },
      unavailable: {
        marginTop: Spacing.xs,
        padding: Spacing.sm,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(12, 10, 28, 0.72)',
        gap: 4,
      },
      unavailableTitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      unavailableBody: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
    }),
  );

  const canJumpToSky = useCallback(
    (id: string) => {
      if (resolveAnchorForOwner) {
        return Boolean(resolveAnchorForOwner(id));
      }
      return nearbyAnchors.some((anchor) => anchor.ownerId === id);
    },
    [nearbyAnchors, resolveAnchorForOwner],
  );

  const handleViewSky = useCallback(
    (result: SkySearchResult) => {
      if (result.canViewSky && result.publicSkyId) {
        setUnavailableId(null);
        onClose();
        if (onViewSky) {
          onViewSky(result.publicSkyId);
        } else {
          router.push(`/public-sky?id=${result.publicSkyId}` as never);
        }
        return;
      }
      setUnavailableId(result.id);
    },
    [onClose, onViewSky, router],
  );

  const handleViewProfile = useCallback(
    (id: string) => {
      onClose();
      router.push(`/public-sky?id=${id}` as never);
    },
    [onClose, router],
  );

  const handleJumpToSky = useCallback(
    (id: string) => {
      if (canJumpToSky(id) && onJumpToSky) {
        onJumpToSky(id);
        onClose();
      }
    },
    [canJumpToSky, onClose, onJumpToSky],
  );

  const handleAction = useCallback(
    (kind: SearchResultActionKind, result: SkySearchResult) => {
      switch (kind) {
        case 'jump':
          handleJumpToSky(result.id);
          return;
        case 'view-sky':
          handleViewSky(result);
          return;
        case 'view-profile':
          handleViewProfile(result.id);
          return;
        case 'connect':
          onClose();
          return;
        case 'connected':
          return;
        default:
          return;
      }
    },
    [handleJumpToSky, handleViewProfile, handleViewSky, onClose],
  );

  const handleDismiss = useCallback(() => {
    setUnavailableId(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleDismiss}>
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>{MySkyCopy.searchTitle}</Text>
              <Pressable accessibilityRole="button" onPress={handleDismiss} style={styles.close}>
                <Text style={styles.closeText}>{MySkyCopy.searchClose}</Text>
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              placeholder={MySkyCopy.searchPlaceholder}
              placeholderTextColor="rgba(235, 228, 248, 0.38)"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
              {totalResults === 0 ? (
                <Text style={styles.empty}>{MySkyCopy.searchEmpty}</Text>
              ) : (
                groups.map((group) => (
                  <View key={group.id} style={styles.group}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.results.map((result) => (
                      <View key={result.id}>
                        <MySkySearchResultRow
                          result={result}
                          canJumpToSky={canJumpToSky(result.id)}
                          exploreGroup={group.id === 'explore'}
                          onAction={handleAction}
                        />
                        {unavailableId === result.id ? (
                          <View style={styles.unavailable}>
                            <Text style={styles.unavailableTitle}>
                              {MySkyCopy.searchSkyUnavailable}
                            </Text>
                            <Text style={styles.unavailableBody}>
                              {MySkyCopy.searchSkyUnavailableBody}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const MySkySearchSheet = memo(MySkySearchSheetComponent);
