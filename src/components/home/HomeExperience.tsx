import { memo, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeAroundYourSkySection } from '@/components/home/HomeAroundYourSkySection';
import { HomeArrivalHeader } from '@/components/home/HomeArrivalHeader';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HomeGrowingInSection } from '@/components/home/HomeGrowingInSection';
import { HomeMySkyCard } from '@/components/home/HomeMySkyCard';
import { HomeSkywriteBar } from '@/components/home/HomeSkywriteBar';
import { HomeStarpathCard } from '@/components/home/HomeStarpathCard';
import { HomeTodayFocusSection } from '@/components/home/HomeTodayFocusSection';
import { HomeTopNav } from '@/components/home/HomeTopNav';
import { ReelyouEasing } from '@/constants/animation';
import { HomeCopy } from '@/constants/homeCopy';
import { TabBarHeight } from '@/constants/theme';
import { HomeLayout, HomeMotion, measureHomePadH } from '@/constants/homeLayout';
import { consumeHomeArrivalPending } from '@/home';

interface HomeExperienceProps {
  calmEntry?: boolean;
}

function HomeExperienceComponent({ calmEntry = false }: HomeExperienceProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padH = measureHomePadH(screenWidth);
  const tabContentInset = TabBarHeight + Math.max(insets.bottom, 8);
  const scrollBottomInset = HomeLayout.scrollBottomExtra + tabContentInset;
  const [reduceMotion, setReduceMotion] = useState(false);

  const isArrival = useMemo(() => {
    if (calmEntry) return false;
    return consumeHomeArrivalPending();
  }, [calmEntry]);

  const screenOp = useSharedValue(isArrival ? 0 : 1);
  const greetingOp = useSharedValue(isArrival ? 0 : 1);
  const greetingY = useSharedValue(isArrival ? 10 : 0);
  const supportOp = useSharedValue(isArrival ? 0 : 1);
  const profileOp = useSharedValue(isArrival ? 0 : 1);
  const zone0 = useSharedValue(isArrival ? 0 : 1);
  const zone1 = useSharedValue(isArrival ? 0 : 1);
  const zone2 = useSharedValue(isArrival ? 0 : 1);
  const zone3 = useSharedValue(isArrival ? 0 : 1);
  const zone4 = useSharedValue(isArrival ? 0 : 1);
  const zone5 = useSharedValue(isArrival ? 0 : 1);

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (live) setReduceMotion(v);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      screenOp.value = 1;
      greetingOp.value = 1;
      supportOp.value = 1;
      profileOp.value = 1;
      greetingY.value = 0;
      zone0.value = zone1.value = zone2.value = zone3.value = zone4.value = zone5.value = 1;
      return;
    }

    const fadeMs = isArrival ? HomeMotion.greetingFadeMs : HomeMotion.returnFadeMs;
    const contentMs = isArrival ? HomeMotion.contentFadeMs : HomeMotion.returnFadeMs;
    const stagger = isArrival ? HomeMotion.contentStaggerMs : 40;
    const screenMs = isArrival ? HomeMotion.screenTransitionMs : HomeMotion.returnFadeMs;

    screenOp.value = withTiming(1, { duration: screenMs, easing: ReelyouEasing.out });
    greetingOp.value = withDelay(120, withTiming(1, { duration: fadeMs, easing: ReelyouEasing.out }));
    greetingY.value = withDelay(120, withTiming(0, { duration: fadeMs, easing: ReelyouEasing.out }));
    supportOp.value = withDelay(200, withTiming(1, { duration: fadeMs, easing: ReelyouEasing.out }));
    profileOp.value = withDelay(160, withTiming(1, { duration: fadeMs, easing: ReelyouEasing.out }));

    [zone0, zone1, zone2, zone3, zone4, zone5].forEach((zone, i) => {
      zone.value = withDelay(
        260 + i * stagger,
        withTiming(1, { duration: contentMs, easing: ReelyouEasing.out }),
      );
    });
  }, [
    greetingOp,
    greetingY,
    isArrival,
    profileOp,
    reduceMotion,
    screenOp,
    supportOp,
    zone0,
    zone1,
    zone2,
    zone3,
    zone4,
    zone5,
  ]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOp.value }));
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greetingOp.value,
    transform: [{ translateY: greetingY.value }],
  }));
  const supportStyle = useAnimatedStyle(() => ({ opacity: supportOp.value }));
  const profileStyle = useAnimatedStyle(() => ({ opacity: profileOp.value }));
  const zone0Style = useAnimatedStyle(() => ({ opacity: zone0.value }));
  const zone1Style = useAnimatedStyle(() => ({ opacity: zone1.value }));
  const zone2Style = useAnimatedStyle(() => ({ opacity: zone2.value }));
  const zone3Style = useAnimatedStyle(() => ({ opacity: zone3.value }));
  const zone4Style = useAnimatedStyle(() => ({ opacity: zone4.value }));
  const zone5Style = useAnimatedStyle(() => ({ opacity: zone5.value }));

  return (
    <View style={[styles.root, { marginBottom: -tabContentInset }]}>
      <HomeBackdrop reduceMotion={reduceMotion} />

      <Animated.View style={[styles.foreground, screenStyle]}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: padH, paddingBottom: scrollBottomInset },
            ]}
            showsVerticalScrollIndicator={false}
            bounces
            nestedScrollEnabled>
            <HomeTopNav />
            <HomeArrivalHeader
              greetingStyle={greetingStyle}
              supportStyle={supportStyle}
              profileStyle={profileStyle}
              supportLine={HomeCopy.arrivalSupport}
            />
            <HomeSkywriteBar animatedStyle={zone0Style} />
            <HomeAroundYourSkySection animatedStyle={zone1Style} />
            <HomeStarpathCard animatedStyle={zone2Style} />
            <HomeMySkyCard animatedStyle={zone3Style} />
            <HomeGrowingInSection animatedStyle={zone4Style} />
            <HomeTodayFocusSection animatedStyle={zone5Style} />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export const HomeExperience = memo(HomeExperienceComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#05070A',
  },
  foreground: {
    flex: 1,
    width: '100%',
  },
  safe: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    width: '100%',
    paddingTop: 0,
    gap: HomeLayout.sectionGap,
  },
});
