import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyHistoryLayer } from '@/components/my-sky/MySkyHistoryLayer';
import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { HomePalette } from '@/constants/homeLayout';
import { SkyArrivalCopy } from '@/constants/skyArrivalCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function MySkyScreen() {
  const {
    mySkyView,
    toggleMySkyLayer,
    triggerConstellationReveal,
    constellationRevealCount,
    constellationRevealActive,
  } = useOnboarding();
  const { visibleLayers } = mySkyView.viewState;
  const northStarText = mySkyView.northStar.originalVision.trim();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: '#05070A',
      },
      safe: {
        flex: 1,
      },
      scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
      },
      header: {
        paddingTop: 4,
        paddingBottom: Spacing.sm,
        alignItems: 'center',
        gap: 4,
        zIndex: 2,
      },
      logoWrap: {
        marginBottom: 4,
      },
      headerTitle: {
        fontFamily: Fonts.serif,
        fontSize: 26,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.2,
      },
      headerSubtitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(235, 228, 248, 0.68)',
        textAlign: 'center',
        maxWidth: 300,
        marginBottom: Spacing.sm,
      },
      canvasSection: {
        width: '100%',
        minHeight: 460,
        marginBottom: Spacing.lg,
      },
      section: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
      },
      sectionTitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: tokens.gold,
      },
      northStarCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.28)',
        backgroundColor: 'rgba(12, 10, 28, 0.55)',
        padding: Spacing.md,
        gap: 6,
      },
      northStarLabel: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: tokens.gold,
        textTransform: 'uppercase',
      },
      northStarBody: {
        fontFamily: Fonts.serif,
        fontSize: 17,
        lineHeight: 24,
        color: tokens.primaryText,
      },
      northStarEmpty: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
      },
      patternCard: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
        backgroundColor: 'rgba(8, 10, 26, 0.55)',
        padding: Spacing.md,
        gap: 4,
      },
      patternLabel: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      patternNote: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      chip: {
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.25)',
        paddingVertical: 6,
        paddingHorizontal: 12,
      },
      chipText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: tokens.primaryText,
      },
      hint: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.mutedText,
      },
    }),
  );

  return (
    <View style={styles.root}>
      <MySkyBackdrop dim />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <HomeHeaderLogo />
            </View>
            <Text style={styles.headerTitle}>{SkyArrivalCopy.mySkyTitle}</Text>
            <Text style={styles.headerSubtitle}>{SkyArrivalCopy.mySkySubtitle}</Text>
          </View>

          <View style={styles.canvasSection}>
            <MySkyStarCanvas
              immersive
              view={mySkyView}
              onToggleLayer={toggleMySkyLayer}
              onRevealConstellations={triggerConstellationReveal}
              constellationRevealCount={constellationRevealCount}
              constellationRevealActive={constellationRevealActive}
            />
            <Text style={styles.hint}>{MySkyCopy.exploreHint}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{MySkyCopy.northStarTitle}</Text>
            <View style={styles.northStarCard}>
              <Text style={styles.northStarLabel}>{MySkyCopy.northStarHint}</Text>
              {northStarText ? (
                <Text style={styles.northStarBody}>{northStarText}</Text>
              ) : (
                <Text style={styles.northStarEmpty}>{MySkyCopy.northStarEmpty}</Text>
              )}
            </View>
          </View>

          {mySkyView.constellations.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{MySkyCopy.constellationsTitle}</Text>
              {mySkyView.constellations.map((pattern) => (
                <View key={pattern.id} style={styles.patternCard} accessibilityRole="text">
                  <Text style={styles.patternLabel}>{pattern.label}</Text>
                  <Text style={styles.patternNote}>{pattern.note}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {visibleLayers.connections && mySkyView.connections.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{MySkyCopy.connectionsTitle}</Text>
              <View style={styles.chipRow}>
                {mySkyView.connections.map((name) => (
                  <View key={name} style={styles.chip}>
                    <Text style={styles.chipText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {visibleLayers.impact && mySkyView.contributions.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{MySkyCopy.contributionsTitle}</Text>
              {mySkyView.contributions.map((title) => (
                <View key={title} style={styles.patternCard}>
                  <Text style={styles.patternNote}>{title}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {visibleLayers.temporal ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{MySkyCopy.historyTitle}</Text>
              <MySkyHistoryLayer evolution={mySkyView.evolution} />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
