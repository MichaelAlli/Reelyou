import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { AroundYourSkyActivityItem } from '@/components/home/AroundYourSkyActivityItem';
import { HomeDismissibleSignalCard } from '@/components/home/HomeDismissibleSignalCard';
import { aroundYourSkyHomeSignalIds } from '@/signals/homeSignalPresentation';
import { AroundYourSkyCopy } from '@/constants/aroundYourSkyCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import { filterAroundYourSkyForHome } from '@/signals/homeSignalPresentation';
import { personalizeAroundYourSkyFeed } from '@/social/aroundYourSky/personalizeHomeFeed';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeAroundYourSkySectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeAroundYourSkySectionComponent({ animatedStyle }: HomeAroundYourSkySectionProps) {
  const { aroundYourSkyFeed } = useOnboarding();
  const { preferences, signalsMeta, dismissHomePresentation } = useReelyouConnect();

  const activeAroundYourSkyItems = useMemo(() => {
    const personalized = personalizeAroundYourSkyFeed(aroundYourSkyFeed, preferences);
    return filterAroundYourSkyForHome(personalized.items, signalsMeta);
  }, [aroundYourSkyFeed, preferences, signalsMeta]);

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
        paddingHorizontal: 8,
        paddingVertical: 2,
      },
      swipeRow: {
        paddingRight: 28,
        paddingTop: 2,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
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

  if (activeAroundYourSkyItems.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.shell, animatedStyle]}>
      <Text style={styles.title}>{AroundYourSkyCopy.title}</Text>
      <Text style={styles.subtitle}>{AroundYourSkyCopy.subtitle}</Text>

      <View style={styles.list}>
        {activeAroundYourSkyItems.map((item, index) => (
          <View key={item.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <HomeDismissibleSignalCard
              style={styles.swipeRow}
              dismissAccessibilityLabel={`Dismiss ${item.message}`}
              onDismiss={() => dismissHomePresentation(aroundYourSkyHomeSignalIds(item))}
            >
              <AroundYourSkyActivityItem item={item} />
            </HomeDismissibleSignalCard>
          </View>
        ))}
      </View>
      <View style={styles.caughtUp} accessibilityRole="text">
        <Text style={styles.caughtUpPrimary}>{AroundYourSkyCopy.caughtUp}</Text>
        <Text style={styles.caughtUpSecondary}>{AroundYourSkyCopy.caughtUpSecondary}</Text>
      </View>
    </Animated.View>
  );
}

export const HomeAroundYourSkySection = memo(HomeAroundYourSkySectionComponent);
