import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { buildSkyHistoryView } from '@/mySky/buildSkyHistoryView';
import type { SkyEvolutionRecord } from '@/mySky/skyEvolution';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyHistoryLayerProps {
  evolution: SkyEvolutionRecord;
}

function MySkyHistoryLayerComponent({ evolution }: MySkyHistoryLayerProps) {
  const items = buildSkyHistoryView(evolution);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        gap: Spacing.sm,
      },
      hint: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 17,
        color: tokens.mutedText,
      },
      list: {
        gap: Spacing.sm,
      },
      row: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        backgroundColor: 'rgba(8, 10, 26, 0.55)',
        padding: Spacing.md,
        gap: 4,
      },
      meta: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
      },
      title: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      summary: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      empty: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
        backgroundColor: 'rgba(8, 10, 26, 0.45)',
        padding: Spacing.md,
        gap: 4,
      },
      emptyTitle: {
        fontFamily: Fonts.serif,
        fontSize: 16,
        color: tokens.primaryText,
      },
      emptyBody: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
    }),
  );

  return (
    <View style={styles.wrap} accessibilityRole="list">
      <Text style={styles.hint}>{MySkyCopy.historyHint}</Text>
      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item.key} style={styles.row} accessibilityRole="text">
              <Text style={styles.meta}>
                {item.dateLabel}
                {item.sourceLabel ? ` · ${item.sourceLabel}` : ''}
              </Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{MySkyCopy.historyEmptyTitle}</Text>
          <Text style={styles.emptyBody}>{MySkyCopy.historyEmptyBody}</Text>
        </View>
      )}
    </View>
  );
}

export const MySkyHistoryLayer = memo(MySkyHistoryLayerComponent);
