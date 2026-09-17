import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  MY_SKY_LAYER_CONTROL_ORDER,
  MY_SKY_LAYER_LABELS,
  MY_SKY_TEMPORARY_REVEAL_LAYERS,
  MySkyLayerCopy,
} from '@/constants/mySkyLayers';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { MySkyLayerId, MySkyVisibleLayers } from '@/mySky/skyLayers';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyLayerControlsProps {
  visibleLayers: MySkyVisibleLayers;
  onToggleLayer: (layer: MySkyLayerId) => void;
  onRevealConstellations: () => void;
  constellationRevealActive?: boolean;
}

function MySkyLayerControlsComponent({
  visibleLayers,
  onToggleLayer,
  onRevealConstellations,
  constellationRevealActive = false,
}: MySkyLayerControlsProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        gap: Spacing.xs,
      },
      hint: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 15,
        color: tokens.mutedText,
        paddingHorizontal: 2,
      },
      scroll: {
        flexGrow: 0,
      },
      row: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 2,
      },
      chip: {
        minHeight: 36,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        backgroundColor: 'rgba(8, 10, 26, 0.45)',
        justifyContent: 'center',
      },
      chipActive: {
        borderColor: 'rgba(232, 200, 114, 0.45)',
        backgroundColor: 'rgba(232, 200, 114, 0.12)',
      },
      chipReveal: {
        borderColor: 'rgba(232, 200, 114, 0.55)',
        backgroundColor: 'rgba(232, 200, 114, 0.18)',
      },
      chipText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        fontWeight: '600',
        color: tokens.secondaryText,
      },
      chipTextActive: {
        color: tokens.gold,
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{MySkyLayerCopy.controlsHint}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
        accessibilityRole="tablist">
        {MY_SKY_LAYER_CONTROL_ORDER.map((layer) => {
          const isTemporary = MY_SKY_TEMPORARY_REVEAL_LAYERS.has(layer);
          const isActive = isTemporary
            ? constellationRevealActive
            : visibleLayers[layer];

          return (
            <Pressable
              key={layer}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${MY_SKY_LAYER_LABELS[layer]} layer`}
              onPress={() =>
                isTemporary ? onRevealConstellations() : onToggleLayer(layer)
              }
              style={[styles.chip, isActive && (isTemporary ? styles.chipReveal : styles.chipActive)]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {MY_SKY_LAYER_LABELS[layer]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const MySkyLayerControls = memo(MySkyLayerControlsComponent);
