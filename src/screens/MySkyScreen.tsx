import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { ScreenLayout } from '@/components/ScreenLayout';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function MySkyScreen() {
  const router = useRouter();
  const { mySkyView } = useOnboarding();
  const northStarText = mySkyView.northStar.originalVision.trim();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      homeLink: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
        minHeight: 44,
        justifyContent: 'center',
      },
      homeLinkText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        color: tokens.gold,
        fontWeight: '600',
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 28,
        fontWeight: '600',
        color: tokens.primaryText,
        marginTop: Spacing.sm,
        letterSpacing: -0.3,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 22,
        color: tokens.secondaryText,
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
    <ScreenLayout showTabBar>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MySkyCopy.homeLink}
        onPress={() => router.push('/(tabs)/home' as never)}
        style={styles.homeLink}>
        <Text style={styles.homeLinkText}>{MySkyCopy.homeLink}</Text>
      </Pressable>

      <Text style={styles.title}>{MySkyCopy.title}</Text>
      <Text style={styles.subtitle}>{MySkyCopy.subtitle}</Text>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{MySkyCopy.starsTitle}</Text>
        <MySkyStarCanvas view={mySkyView} />
        <Text style={styles.hint}>{MySkyCopy.exploreHint}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{MySkyCopy.constellationsTitle}</Text>
        {mySkyView.constellations.map((pattern) => (
          <View key={pattern.id} style={styles.patternCard} accessibilityRole="text">
            <Text style={styles.patternLabel}>{pattern.label}</Text>
            <Text style={styles.patternNote}>{pattern.note}</Text>
          </View>
        ))}
      </View>

      {mySkyView.connections.length > 0 ? (
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

      {mySkyView.contributions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{MySkyCopy.contributionsTitle}</Text>
          {mySkyView.contributions.map((title) => (
            <View key={title} style={styles.patternCard}>
              <Text style={styles.patternNote}>{title}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScreenLayout>
  );
}
