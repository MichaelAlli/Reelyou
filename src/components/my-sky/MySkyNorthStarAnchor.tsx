import { memo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MySkyNorthStarAnchorProps {
  northStarText: string;
  centered?: boolean;
}

function MySkyNorthStarAnchorComponent({ northStarText, centered = false }: MySkyNorthStarAnchorProps) {
  const [expanded, setExpanded] = useState(false);
  const hasText = northStarText.length > 0;

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        gap: Spacing.xs,
        alignItems: centered ? 'center' : 'flex-start',
        position: 'relative',
        zIndex: 3,
      },
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: centered ? 'center' : 'flex-start',
        gap: 6,
        minHeight: 30,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.45)',
        backgroundColor: 'rgba(12, 10, 28, 0.72)',
        shadowColor: tokens.gold,
        shadowOpacity: centered ? 0.35 : 0.2,
        shadowRadius: centered ? 10 : 6,
        shadowOffset: { width: 0, height: 0 },
      },
      chipGlow: {
        fontSize: 12,
        color: tokens.gold,
      },
      chipLabel: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        fontWeight: '600',
        color: tokens.gold,
      },
      chipHint: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        color: tokens.mutedText,
      },
      panel: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.28)',
        backgroundColor: 'rgba(8, 8, 24, 0.92)',
        padding: Spacing.sm,
        gap: 4,
        width: centered ? 280 : '100%',
        maxWidth: '100%',
        ...(centered
          ? {
              position: 'absolute',
              top: 40,
              zIndex: 4,
            }
          : null),
      },
      panelLabel: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: tokens.gold,
        textTransform: 'uppercase',
      },
      panelBody: {
        fontFamily: Fonts.serif,
        fontSize: 15,
        lineHeight: 21,
        color: tokens.primaryText,
      },
      panelEmpty: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
    }),
  );

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((open) => !open);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded ? 'Collapse North Star' : `${MySkyCopy.northStarTitle}. Tap to ${hasText ? 'view' : 'learn about'} your direction.`
        }
        onPress={toggle}
        style={styles.chip}>
        <Text style={styles.chipGlow}>✦</Text>
        <Text style={styles.chipLabel}>{MySkyCopy.northStarTitle}</Text>
        <Text style={styles.chipHint}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.panel} accessibilityRole="summary">
          <Text style={styles.panelLabel}>{MySkyCopy.northStarHint}</Text>
          {hasText ? (
            <Text style={styles.panelBody}>{northStarText}</Text>
          ) : (
            <Text style={styles.panelEmpty}>{MySkyCopy.northStarEmpty}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

export const MySkyNorthStarAnchor = memo(MySkyNorthStarAnchorComponent);
