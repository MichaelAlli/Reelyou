import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import type { EmergingGroup, FocusedSkySection } from '@/sharedSky/sharedSkyTypes';

interface FocusedSkySectionListProps {
  sections: FocusedSkySection[];
  emergingGroups: EmergingGroup[];
  joinedGroups: EmergingGroup[];
  onOpenGroup: (group: EmergingGroup) => void;
  onOpenMySky: () => void;
  onPinStar?: (nodeId: string) => void;
  peaceCopy?: string;
}

function FocusedSkySectionListComponent({
  sections,
  emergingGroups,
  joinedGroups,
  onOpenGroup,
  onOpenMySky,
  onPinStar,
  peaceCopy,
}: FocusedSkySectionListProps) {
  const groupById = new Map([...emergingGroups, ...joinedGroups].map((group) => [group.id, group]));

  return (
    <View style={styles.root}>
      {sections
        .filter((section) => section.kind !== 'snapshot')
        .map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.title}>{section.title}</Text>
            {section.kind === 'peace' ? (
              <Text style={styles.body}>
                {peaceCopy ??
                  'Nothing urgent is asking for your attention right now. Your sky can stay spacious.'}
              </Text>
            ) : null}
            {section.groupIds.map((groupId) => {
              const group = groupById.get(groupId);
              if (!group) return null;
              return (
                <Pressable
                  key={groupId}
                  accessibilityRole="button"
                  onPress={() => onOpenGroup(group)}
                  style={styles.row}>
                  <View style={styles.emblem} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{group.title}</Text>
                    <Text style={styles.rowHint} numberOfLines={2}>
                      {group.whyThis}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            {section.nodeIds.slice(0, 6).map((nodeId) => (
              <View key={nodeId} style={styles.starRow}>
                <View style={styles.microStar} />
                <Text style={styles.starLabel}>Meaningful star</Text>
                {onPinStar ? (
                  <Pressable accessibilityRole="button" onPress={() => onPinStar(nodeId)}>
                    <Text style={styles.pinAction}>Pin</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ))}

      <Pressable accessibilityRole="button" onPress={onOpenMySky} style={styles.exploreCta}>
        <Text style={styles.exploreLabel}>Explore your full My Sky universe</Text>
      </Pressable>
    </View>
  );
}

export const FocusedSkySectionList = memo(FocusedSkySectionListComponent);

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#F5F0FF',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(235, 228, 248, 0.78)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(232, 200, 114, 0.14)',
  },
  emblem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 168, 255, 0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 15,
    color: '#FFF8F0',
  },
  rowHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235, 228, 248, 0.72)',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  microStar: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 213, 122, 0.85)',
  },
  starLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(245, 240, 255, 0.85)',
  },
  pinAction: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 12,
    color: '#E8C872',
  },
  exploreCta: {
    marginTop: Spacing.md,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  exploreLabel: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
    color: '#E8C872',
  },
});
