import { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyNearbySheetProps {
  visible: boolean;
  anchors: NearbySkyAnchor[];
  onClose: () => void;
  onJumpToSky: (anchor: NearbySkyAnchor) => void;
}

function MySkyNearbySheetComponent({
  visible,
  anchors,
  onClose,
  onJumpToSky,
}: MySkyNearbySheetProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '62%',
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
        marginBottom: 4,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: tokens.mutedText,
        marginBottom: Spacing.sm,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(167, 139, 250, 0.14)',
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
        fontSize: 14,
        fontWeight: '700',
        color: tokens.appBackground,
      },
      copy: { flex: 1 },
      name: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      context: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
        marginTop: 2,
      },
      action: {
        minHeight: 32,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(232, 200, 114, 0.16)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.38)',
      },
      actionText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
      },
      empty: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.mutedText,
        paddingVertical: Spacing.md,
      },
      close: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
        paddingHorizontal: 2,
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        color: tokens.mutedText,
      },
    }),
  );

  const tierLabel = (tier: NearbySkyAnchor['tier']) => {
    if (tier === 'shared-community') return MySkyCopy.nearbySharedCommunity;
    if (tier === 'explore') return MySkyCopy.nearbyExplore;
    return MySkyCopy.nearbyConnected;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.handle} />
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <Text style={styles.title}>{MySkyCopy.nearbyTitle}</Text>
            <Text style={styles.subtitle}>{MySkyCopy.nearbySubtitle}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {anchors.length === 0 ? (
                <Text style={styles.empty}>{MySkyCopy.nearbyEmpty}</Text>
              ) : (
                anchors.map((anchor) => (
                  <View key={anchor.id} style={styles.row}>
                    <View style={[styles.avatar, { backgroundColor: anchor.owner.avatarColor }]}>
                      <Text style={styles.avatarText}>{anchor.owner.avatarInitials}</Text>
                    </View>
                    <View style={styles.copy}>
                      <Text style={styles.name}>{anchor.owner.name}</Text>
                      <Text style={styles.context}>{tierLabel(anchor.tier)}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${MySkyCopy.searchJumpToSky}: ${anchor.owner.name}`}
                      onPress={() => {
                        onJumpToSky(anchor);
                        onClose();
                      }}
                      style={styles.action}>
                      <Text style={styles.actionText}>{MySkyCopy.searchJumpToSky}</Text>
                    </Pressable>
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

export const MySkyNearbySheet = memo(MySkyNearbySheetComponent);
