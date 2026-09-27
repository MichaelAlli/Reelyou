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

import { JoinedGroupsConstellationIcon } from '@/components/my-sky/JoinedGroupsConstellationIcon';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts, Spacing } from '@/constants/theme';
import type { MySkyConstellationFormation } from '@/emergingConstellations/buildMySkyConstellationFormations';

interface MySkyConstellationsSheetProps {
  visible: boolean;
  formations: readonly MySkyConstellationFormation[];
  onClose: () => void;
  onSelectFormation: (constellationId: string) => void;
}

function formationStateLabel(state: MySkyConstellationFormation['state']): string {
  switch (state) {
    case 'Joined':
      return MySkyCopy.constellationFormationJoined;
    case 'Forming':
      return MySkyCopy.constellationFormationForming;
    default:
      return MySkyCopy.constellationFormationEmerging;
  }
}

function MySkyConstellationsSheetComponent({
  visible,
  formations,
  onClose,
  onSelectFormation,
}: MySkyConstellationsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close constellations" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{MySkyCopy.constellationsSheetTitle}</Text>
          <Text style={styles.subtitle}>{MySkyCopy.constellationsSheetSubtitle}</Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {formations.length === 0 ? (
              <Text style={styles.empty}>{MySkyCopy.constellationsSheetEmpty}</Text>
            ) : (
              formations.map(({ constellation, state }) => (
                <Pressable
                  key={constellation.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${constellation.name}, ${formationStateLabel(state)}`}
                  onPress={() => onSelectFormation(constellation.id)}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.visual}>
                    <JoinedGroupsConstellationIcon size={44} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {constellation.name}
                    </Text>
                    <Text style={styles.cardState}>{formationStateLabel(state)}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.done}>
            <Text style={styles.doneText}>{MySkyCopy.joinedGroupsSheetClose}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export const MySkyConstellationsSheet = memo(MySkyConstellationsSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 14, 0.55)',
  },
  safe: {
    justifyContent: 'flex-end',
  },
  sheet: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 12, 26, 0.97)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.28)',
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    maxHeight: '56%',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(248, 244, 236, 0.52)',
    marginTop: 4,
    marginBottom: 10,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.62)',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 18, 38, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.22)',
  },
  cardPressed: {
    opacity: 0.92,
  },
  visual: {
    width: 52,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.94)',
  },
  cardState: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.72)',
  },
  done: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  doneText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.5)',
  },
});
