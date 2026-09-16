import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface SkywriteAccordionRowProps {
  icon?: string;
  title: string;
  summary?: string;
  badge?: string;
  selectedChip?: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
  accessibilityLabel: string;
}

function SkywriteAccordionRowComponent({
  icon,
  title,
  summary,
  badge,
  selectedChip,
  expanded,
  onToggle,
  children,
  accessibilityLabel,
}: SkywriteAccordionRowProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.header}>
        <LinearGradient
          colors={['rgba(12, 10, 32, 0.82)', 'rgba(8, 8, 24, 0.88)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerInner}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {badge ? <Text style={styles.badge}>{badge}</Text> : null}
              {selectedChip}
            </View>
            {summary && !expanded ? <Text style={styles.summary}>{summary}</Text> : null}
          </View>
          <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
        </View>
      </Pressable>
      {expanded && children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

export const SkywriteAccordionRow = memo(SkywriteAccordionRowComponent);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    overflow: 'hidden',
    backgroundColor: 'rgba(6, 8, 22, 0.45)',
  },
  header: {
    minHeight: 48,
    justifyContent: 'center',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  badge: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  summary: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.68)',
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: HomePalette.gold,
    paddingLeft: 4,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(167, 139, 250, 0.14)',
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 10,
    gap: 10,
  },
});
