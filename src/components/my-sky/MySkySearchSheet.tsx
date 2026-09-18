import { useRouter } from 'expo-router';
import { memo, useMemo, useState } from 'react';
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

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import { buildSkySearchResults } from '@/mySky/skySearchSources';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkySearchSheetProps {
  visible: boolean;
  onClose: () => void;
  nearbyAnchors?: NearbySkyAnchor[];
  onJumpToSky?: (ownerId: string) => void;
  resolveAnchorForOwner?: (ownerId: string) => NearbySkyAnchor | null;
}

function MySkySearchSheetComponent({
  visible,
  onClose,
  nearbyAnchors = [],
  onJumpToSky,
  resolveAnchorForOwner,
}: MySkySearchSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [unavailableId, setUnavailableId] = useState<string | null>(null);
  const { aroundYourSkyFeed, communities } = useOnboarding();

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const results = useMemo(
    () => buildSkySearchResults(query, aroundYourSkyFeed, connectionActivities, communities),
    [aroundYourSkyFeed, communities, connectionActivities, query],
  );

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '78%',
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
      title: {
        fontFamily: Fonts.serif,
        fontSize: 20,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: Spacing.sm,
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
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.2)',
        backgroundColor: 'rgba(12, 10, 28, 0.55)',
      },
      avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '700',
        color: '#05070A',
      },
      copy: {
        flex: 1,
        gap: 2,
        minWidth: 0,
      },
      name: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
      context: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        color: tokens.gold,
        letterSpacing: 0.2,
      },
      actions: {
        gap: 6,
        alignItems: 'flex-end',
      },
      action: {
        minHeight: 32,
        paddingHorizontal: 10,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.4)',
        backgroundColor: 'rgba(232, 200, 114, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      actionSecondary: {
        borderColor: 'rgba(167, 139, 250, 0.35)',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
      },
      actionText: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        color: tokens.gold,
      },
      actionTextSecondary: {
        color: tokens.secondaryText,
      },
      empty: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.mutedText,
        paddingVertical: Spacing.md,
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
      close: {
        alignSelf: 'flex-end',
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.xs,
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

  const handleViewSky = (publicSkyId: string | null, canViewSky: boolean, id: string) => {
    if (canViewSky && publicSkyId) {
      setUnavailableId(null);
      onClose();
      router.push(`/public-sky?id=${publicSkyId}` as never);
      return;
    }
    setUnavailableId(id);
  };

  const handleViewProfile = (id: string) => {
    onClose();
    router.push(`/public-sky?id=${id}` as never);
  };

  const canJumpToSky = (id: string) => {
    if (resolveAnchorForOwner) {
      return Boolean(resolveAnchorForOwner(id));
    }
    return nearbyAnchors.some((anchor) => anchor.ownerId === id);
  };

  const handleJumpToSky = (id: string) => {
    if (canJumpToSky(id) && onJumpToSky) {
      onJumpToSky(id);
      onClose();
    }
  };

  const handleClose = () => {
    setQuery('');
    setUnavailableId(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <Pressable accessibilityRole="button" onPress={handleClose} style={styles.close}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <Text style={styles.title}>{MySkyCopy.searchTitle}</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={MySkyCopy.searchPlaceholder}
              placeholderTextColor="rgba(235, 228, 248, 0.38)"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
              {results.length === 0 ? (
                <Text style={styles.empty}>{MySkyCopy.searchEmpty}</Text>
              ) : (
                results.map((result) => (
                  <View key={result.id}>
                    <View style={styles.row}>
                      <View style={[styles.avatar, { backgroundColor: result.avatarColor }]}>
                        <Text style={styles.avatarText}>{result.avatarInitials}</Text>
                      </View>
                      <View style={styles.copy}>
                        <Text style={styles.name}>{result.name}</Text>
                        <Text style={styles.subtitle} numberOfLines={2}>
                          {result.subtitle}
                        </Text>
                        <Text style={styles.context}>{result.contextLabel}</Text>
                      </View>
                      <View style={styles.actions}>
                        {canJumpToSky(result.id) && onJumpToSky ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${MySkyCopy.searchJumpToSky}: ${result.name}`}
                            onPress={() => handleJumpToSky(result.id)}
                            style={[styles.action, styles.actionSecondary]}>
                            <Text style={[styles.actionText, styles.actionTextSecondary]}>
                              {MySkyCopy.searchJumpToSky}
                            </Text>
                          </Pressable>
                        ) : null}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${MySkyCopy.searchViewProfile}: ${result.name}`}
                          onPress={() => handleViewProfile(result.id)}
                          style={[styles.action, styles.actionSecondary]}>
                          <Text style={[styles.actionText, styles.actionTextSecondary]}>
                            {MySkyCopy.searchViewProfile}
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${MySkyCopy.searchViewSky}: ${result.name}`}
                          onPress={() =>
                            handleViewSky(result.publicSkyId, result.canViewSky, result.id)
                          }
                          style={styles.action}>
                          <Text style={styles.actionText}>{MySkyCopy.searchViewSky}</Text>
                        </Pressable>
                      </View>
                    </View>
                    {unavailableId === result.id ? (
                      <View style={styles.unavailable}>
                        <Text style={styles.unavailableTitle}>{MySkyCopy.searchSkyUnavailable}</Text>
                        <Text style={styles.unavailableBody}>{MySkyCopy.searchSkyUnavailableBody}</Text>
                      </View>
                    ) : null}
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
