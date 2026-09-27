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
import { joinedGroupStatusLine } from '@/emergingConstellations/joinedGroupActivityPresentation';
import type { EmergingConstellation } from '@/emergingConstellations/emergingConstellationTypes';
import type { ReelyouSignal } from '@/signals/reelyouSignalTypes';
import type { ReelyouSignalsMetaState } from '@/signals/reelyouSignalTypes';

interface MySkyJoinedGroupsSheetProps {
  visible: boolean;
  groups: EmergingConstellation[];
  signals: readonly ReelyouSignal[];
  signalsMeta: ReelyouSignalsMetaState;
  onClose: () => void;
  onSelectGroup: (communityId: string) => void;
}

function MySkyJoinedGroupsSheetComponent({
  visible,
  groups,
  signals,
  signalsMeta,
  onClose,
  onSelectGroup,
}: MySkyJoinedGroupsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close groups" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{MySkyCopy.joinedGroupsSheetTitle}</Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {groups.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{MySkyCopy.joinedGroupsSheetEmpty}</Text>
                <Text style={styles.emptyHint}>{MySkyCopy.joinedGroupsSheetEmptyHint}</Text>
              </View>
            ) : (
              groups.map((group) => (
                <Pressable
                  key={group.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${group.name}. ${joinedGroupStatusLine(group.id, signals, signalsMeta)}`}
                  onPress={() => onSelectGroup(group.id)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <JoinedGroupsConstellationIcon size={36} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {group.name}
                    </Text>
                    <Text style={styles.rowStatus} numberOfLines={1}>
                      {joinedGroupStatusLine(group.id, signals, signalsMeta)}
                    </Text>
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

export const MySkyJoinedGroupsSheet = memo(MySkyJoinedGroupsSheetComponent);

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
    borderColor: 'rgba(232, 200, 114, 0.28)',
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    maxHeight: '52%',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    marginBottom: 10,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
    paddingBottom: 8,
  },
  empty: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.88)',
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.52)',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 18, 38, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.2)',
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.94)',
  },
  rowStatus: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248, 244, 236, 0.55)',
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
