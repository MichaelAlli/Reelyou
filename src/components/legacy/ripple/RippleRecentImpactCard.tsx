import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RippleMetricIcon } from '@/components/legacy/ripple/RippleMetricIcon';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts } from '@/constants/theme';
import type { RippleRecentItem } from '@/legacy/buildLegacyRippleViewModel';

interface RippleRecentImpactCardProps {
  items: RippleRecentItem[];
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function RippleRecentImpactCard({
  items,
  expanded,
  onToggleExpanded,
}: RippleRecentImpactCardProps) {
  if (items.length === 0) return null;

  return (
    <View style={[rippleGlass.panel, styles.card, !expanded && styles.cardCollapsed]}>
      <Pressable
        onPress={onToggleExpanded}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${RippleCopy.recentImpactTitle}, ${expanded ? 'collapse' : 'expand'}`}>
        <Text style={styles.title}>{RippleCopy.recentImpactTitle}</Text>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
      {expanded ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemWrap}>
              {index > 0 ? <View style={styles.connector} /> : null}
              <View style={styles.item}>
                <View style={[styles.iconCircle, { borderColor: `${item.iconColor}66` }]}>
                  <RippleMetricIcon kind={item.iconKind} color={item.iconColor} size={14} />
                </View>
                <Text style={styles.itemLabel} numberOfLines={3}>
                  {item.label}
                </Text>
                <Text style={styles.itemTime}>{item.relativeTime}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardCollapsed: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(45, 55, 72, 0.55)',
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(45, 55, 72, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 8,
    marginTop: 8,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  connector: {
    width: 18,
    height: 2,
    backgroundColor: 'rgba(45, 55, 72, 0.15)',
    marginTop: 18,
    marginHorizontal: 4,
  },
  item: {
    width: 118,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    color: '#2D3748',
  },
  itemTime: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: 'rgba(45, 55, 72, 0.55)',
  },
});
