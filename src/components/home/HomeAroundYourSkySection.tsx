import { memo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { AroundYourSkyActivityItem } from '@/components/home/AroundYourSkyActivityItem';
import { AroundYourSkyCopy } from '@/constants/aroundYourSkyCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeAroundYourSkySectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeAroundYourSkySectionComponent({ animatedStyle }: HomeAroundYourSkySectionProps) {
  const { aroundYourSkyFeed } = useOnboarding();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      shell: {
        width: '100%',
        gap: 8,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 18.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.15,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
        marginTop: -2,
      },
      list: {
        marginTop: 4,
        borderRadius: HomeLayout.cardRadius,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.18)',
        backgroundColor: 'rgba(8, 10, 26, 0.55)',
        paddingHorizontal: 12,
        paddingVertical: 2,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
      },
      quiet: {
        borderRadius: HomeLayout.cardRadius,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.18)',
        backgroundColor: 'rgba(8, 10, 26, 0.45)',
        paddingHorizontal: 14,
        paddingVertical: 16,
        gap: 4,
      },
      quietTitle: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: HomePalette.textPrimary,
      },
      quietBody: {
        fontFamily: Fonts.sans,
        fontSize: 12.5,
        lineHeight: 17,
        color: tokens.secondaryText,
      },
      caughtUp: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 4,
        gap: 4,
      },
      caughtUpPrimary: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.gold,
      },
      caughtUpSecondary: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: tokens.mutedText,
        textAlign: 'center',
      },
    }),
  );

  return (
    <Animated.View style={[styles.shell, animatedStyle]}>
      <Text style={styles.title}>{AroundYourSkyCopy.title}</Text>
      <Text style={styles.subtitle}>{AroundYourSkyCopy.subtitle}</Text>

      {aroundYourSkyFeed.isQuiet ? (
        <View style={styles.quiet} accessibilityRole="text">
          <Text style={styles.quietTitle}>{AroundYourSkyCopy.quietTitle}</Text>
          <Text style={styles.quietBody}>{AroundYourSkyCopy.quietBody}</Text>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {aroundYourSkyFeed.items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <AroundYourSkyActivityItem item={item} />
              </View>
            ))}
          </View>
          <View style={styles.caughtUp} accessibilityRole="text">
            <Text style={styles.caughtUpPrimary}>{AroundYourSkyCopy.caughtUp}</Text>
            <Text style={styles.caughtUpSecondary}>{AroundYourSkyCopy.caughtUpSecondary}</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

export const HomeAroundYourSkySection = memo(HomeAroundYourSkySectionComponent);
