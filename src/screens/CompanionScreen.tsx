import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { GuidingLightCopy } from '@/constants/guidingLightCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

/** Beta Companion destination — context-ready, not full chat. */
export function CompanionScreen() {
  const router = useRouter();
  const { aiContext } = useOnboarding();

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
      sectionTitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: tokens.gold,
        marginBottom: Spacing.sm,
      },
      card: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
        backgroundColor: 'rgba(8, 10, 26, 0.55)',
        padding: Spacing.md,
        gap: 8,
        marginBottom: Spacing.md,
      },
      cardTitle: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      cardItem: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      hint: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.mutedText,
      },
      empty: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
      },
    }),
  );

  return (
    <ScreenLayout showTabBar={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={GuidingLightCopy.companionBack}
        onPress={() => router.back()}
        style={styles.homeLink}>
        <Text style={styles.homeLinkText}>{GuidingLightCopy.companionBack}</Text>
      </Pressable>

      <Text style={styles.title}>{GuidingLightCopy.companionTitle}</Text>
      <Text style={styles.subtitle}>{GuidingLightCopy.companionSubtitle}</Text>

      {aiContext.enabled && aiContext.sections.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{GuidingLightCopy.companionContextTitle}</Text>
          <Text style={styles.hint}>{GuidingLightCopy.companionContextHint}</Text>
          {aiContext.sections.map((section) => (
            <View key={section.id} style={styles.card}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <Text key={item} style={styles.cardItem}>
                  {item}
                </Text>
              ))}
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.empty}>{GuidingLightCopy.companionEmpty}</Text>
      )}
    </ScreenLayout>
  );
}
