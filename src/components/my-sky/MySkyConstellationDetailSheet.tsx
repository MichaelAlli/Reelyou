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
import type { ConstellationDetailView } from '@/mySky/buildConstellationDetailView';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyConstellationDetailSheetProps {
  visible: boolean;
  detail: ConstellationDetailView | null;
  onClose: () => void;
  onSelectStar: (nodeId: string) => void;
}

function MySkyConstellationDetailSheetComponent({
  visible,
  detail,
  onClose,
  onSelectStar,
}: MySkyConstellationDetailSheetProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '52%',
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.28)',
        backgroundColor: 'rgba(8, 8, 24, 0.96)',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
      },
      handle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(232, 200, 114, 0.35)',
        marginVertical: Spacing.sm,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 20,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: 6,
      },
      reason: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
        marginBottom: Spacing.sm,
      },
      sectionLabel: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.35,
        color: tokens.gold,
        textTransform: 'uppercase',
        marginBottom: 8,
      },
      starRow: {
        borderRadius: Radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.25)',
        backgroundColor: 'rgba(12, 10, 28, 0.72)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
      },
      starTitle: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      starType: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
        marginTop: 2,
      },
      close: {
        alignSelf: 'flex-end',
        marginTop: 4,
        paddingVertical: 6,
        paddingHorizontal: 4,
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: tokens.mutedText,
      },
    }),
  );

  if (!detail) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView edges={['bottom']} style={{ width: '100%' }}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>{detail.label}</Text>
            <Text style={styles.reason}>{detail.reason}</Text>
            <Text style={styles.sectionLabel}>{MySkyCopy.constellationConnectedStars}</Text>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {detail.connectedStars.map((star) => (
                <Pressable
                  key={star.nodeId}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${star.title}`}
                  onPress={() => onSelectStar(star.nodeId)}
                  style={styles.starRow}>
                  <Text style={styles.starTitle}>{star.title}</Text>
                  <Text style={styles.starType}>{star.typeLabel}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>{MySkyCopy.constellationDetailClose}</Text>
            </Pressable>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

export const MySkyConstellationDetailSheet = memo(MySkyConstellationDetailSheetComponent);
