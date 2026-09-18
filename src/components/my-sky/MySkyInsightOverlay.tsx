import { memo, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';

import { MySkyHistoryLayer } from '@/components/my-sky/MySkyHistoryLayer';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { MySkyView } from '@/mySky/types';
import { useThemedStyles } from '@/theme/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MySkyInsightOverlayProps {
  view: Pick<MySkyView, 'constellations' | 'connections' | 'contributions' | 'evolution'>;
  visibleLayers: MySkyVisibleLayers;
  hidden?: boolean;
}

function MySkyInsightOverlayComponent({ view, visibleLayers, hidden = false }: MySkyInsightOverlayProps) {
  const [open, setOpen] = useState(false);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: {
        position: 'absolute',
        left: Spacing.sm,
        right: Spacing.sm,
        bottom: Spacing.xs,
        pointerEvents: 'box-none',
      },
      collapsedChip: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 32,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        backgroundColor: 'rgba(8, 8, 24, 0.78)',
      },
      panel: {
        maxHeight: 160,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.28)',
        backgroundColor: 'rgba(8, 8, 24, 0.9)',
        overflow: 'hidden',
      },
      panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(167, 139, 250, 0.15)',
      },
      panelTitle: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.35,
        color: tokens.gold,
        textTransform: 'uppercase',
      },
      panelToggle: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        color: tokens.mutedText,
      },
      panelBody: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
      },
      section: {
        gap: 4,
      },
      sectionLabel: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
        color: tokens.gold,
        textTransform: 'uppercase',
      },
      row: {
        gap: 2,
      },
      rowLabel: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      rowNote: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
      },
      chip: {
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.25)',
        paddingVertical: 4,
        paddingHorizontal: 10,
      },
      chipText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.primaryText,
      },
    }),
  );

  const showConnections = visibleLayers.connections && view.connections.length > 0;
  const showImpact = visibleLayers.impact && view.contributions.length > 0;
  const showHistory = visibleLayers.temporal;
  const showPatterns = view.constellations.length > 0;

  const summaryLabel = useMemo(() => {
    const parts: string[] = [];
    if (showPatterns) parts.push('Patterns');
    if (showConnections) parts.push('Connections');
    if (showImpact) parts.push('Impact');
    if (showHistory) parts.push('History');
    return parts.join(' · ');
  }, [showConnections, showHistory, showImpact, showPatterns]);

  const hasOverlay = showConnections || showImpact || showHistory || showPatterns;

  if (hidden || !hasOverlay) {
    return null;
  }

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((value) => !value);
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      {!open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sky insights: ${summaryLabel}. Tap to expand.`}
          onPress={toggle}
          style={styles.collapsedChip}
          pointerEvents="auto">
          <Text style={styles.panelTitle}>{summaryLabel}</Text>
          <Text style={styles.panelToggle}>▾</Text>
        </Pressable>
      ) : (
        <View style={styles.panel} pointerEvents="auto">
          <Pressable accessibilityRole="button" onPress={toggle} style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{summaryLabel}</Text>
            <Text style={styles.panelToggle}>▴</Text>
          </Pressable>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <View style={styles.panelBody}>
              {showPatterns ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{MySkyCopy.constellationsTitle}</Text>
                  {view.constellations.map((pattern) => (
                    <View key={pattern.id} style={styles.row}>
                      <Text style={styles.rowLabel}>{pattern.label}</Text>
                      <Text style={styles.rowNote}>{pattern.note}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {showConnections ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{MySkyCopy.connectionsTitle}</Text>
                  <View style={styles.chipRow}>
                    {view.connections.map((name) => (
                      <View key={name} style={styles.chip}>
                        <Text style={styles.chipText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {showImpact ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{MySkyCopy.contributionsTitle}</Text>
                  {view.contributions.map((title) => (
                    <Text key={title} style={styles.rowNote}>
                      {title}
                    </Text>
                  ))}
                </View>
              ) : null}

              {showHistory ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{MySkyCopy.historyTitle}</Text>
                  <MySkyHistoryLayer evolution={view.evolution} />
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export const MySkyInsightOverlay = memo(MySkyInsightOverlayComponent);
