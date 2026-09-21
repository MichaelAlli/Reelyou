import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyCanvas } from '@/components/my-sky/MySkyCanvas';
import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { MySkyStarInteractionOverlay } from '@/components/my-sky/MySkyStarInteractionOverlay';
import { SkyArrivalCopy } from '@/constants/skyArrivalCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { applyArrivalHighlight } from '@/mySky/mySkyState';
import { useOnboarding } from '@/onboarding';

const TOAST_SHOW_DELAY_MS = 500;
const TOAST_VISIBLE_MS = 3500;
const TOAST_FADE_MS = 650;

export function MySkyArrivalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mySkyView, skyArrivalHandoff, clearSkyArrivalHandoff, skywrites, communities, guidingLightView } =
    useOnboarding();
  const [skyLayout, setSkyLayout] = useState({ width: 0, height: 0 });
  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const onSkyLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSkyLayout({ width, height });
    }
  };

  const landedStarIdRef = useRef<string | null>(skyArrivalHandoff?.skyNodeId ?? null);
  const [toastMounted, setToastMounted] = useState(Boolean(skyArrivalHandoff?.justAddedToSky));
  const [arrivalSettled, setArrivalSettled] = useState(false);

  const toastOpacity = useSharedValue(0);
  const toastY = useSharedValue(12);

  const navInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);

  useEffect(() => {
    if (skyArrivalHandoff?.justAddedToSky) return;
    if (landedStarIdRef.current) return;
    router.replace('/(tabs)/sky' as never);
  }, [router, skyArrivalHandoff]);

  useEffect(() => {
    if (!toastMounted) return;

    toastOpacity.value = withDelay(TOAST_SHOW_DELAY_MS, withTiming(1, { duration: TOAST_FADE_MS }));
    toastY.value = withDelay(TOAST_SHOW_DELAY_MS, withTiming(0, { duration: TOAST_FADE_MS }));

    const hideTimer = setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: TOAST_FADE_MS }, (finished) => {
        if (finished) {
          runOnJS(setToastMounted)(false);
        }
      });
      toastY.value = withTiming(8, { duration: TOAST_FADE_MS });
    }, TOAST_SHOW_DELAY_MS + TOAST_VISIBLE_MS);

    const settleTimer = setTimeout(() => {
      setArrivalSettled(true);
      clearSkyArrivalHandoff();
    }, TOAST_SHOW_DELAY_MS + TOAST_VISIBLE_MS + TOAST_FADE_MS + 200);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(settleTimer);
    };
  }, [clearSkyArrivalHandoff, toastMounted, toastOpacity, toastY]);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastY.value }],
  }));

  const stars = useMemo(
    () => applyArrivalHighlight(mySkyView.stars, landedStarIdRef.current),
    [mySkyView.stars],
  );

  const highlightStarId = landedStarIdRef.current;

  if (!skyArrivalHandoff?.justAddedToSky && !landedStarIdRef.current) {
    return null;
  }

  return (
    <View style={styles.root}>
      <MySkyBackdrop dim />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.main, { paddingBottom: navInset }]}>
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <HomeHeaderLogo />
            </View>
            <Text style={styles.headerTitle}>{SkyArrivalCopy.mySkyTitle}</Text>
            <Text style={styles.headerSubtitle}>{SkyArrivalCopy.mySkySubtitle}</Text>
          </View>

          <View style={styles.skyCanvasWrap} onLayout={onSkyLayout}>
            <MySkyCanvas
              view={{ ...mySkyView, stars }}
              highlightStarId={highlightStarId}
              animateArrival={!arrivalSettled}
            />
            <MySkyStarInteractionOverlay
              view={{ ...mySkyView, stars }}
              skywrites={skywrites}
              joinedCommunityIds={joinedCommunityIds}
              guidanceActive={guidanceActive}
              layoutWidth={skyLayout.width}
              layoutHeight={skyLayout.height}
              allowTapDuringGesture
            />
          </View>
        </View>

        {toastMounted ? (
          <Animated.View
            style={[styles.toastWrap, { bottom: navInset + 8 }, toastStyle]}
            pointerEvents="none">
            <View style={styles.toast}>
              <Text style={styles.toastStar}>✦</Text>
              <View style={styles.toastCopy}>
                <Text style={styles.toastTitle}>{SkyArrivalCopy.soaringTitle}</Text>
                <Text style={styles.toastBody}>{SkyArrivalCopy.soaringBody}</Text>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  safe: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  skyCanvasWrap: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
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
  },
  toastWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 3,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    backgroundColor: 'rgba(8, 8, 24, 0.78)',
    padding: 14,
  },
  toastStar: {
    fontSize: 18,
    color: HomePalette.gold,
    marginTop: 2,
  },
  toastCopy: {
    flex: 1,
    gap: 4,
  },
  toastTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: HomePalette.textPrimary,
  },
  toastBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235, 228, 248, 0.72)',
  },
});
