import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeDismissibleSignalCard } from '@/components/home/HomeDismissibleSignalCard';
import { GuidingLightCopy } from '@/constants/guidingLightCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import {
  guidingLightQualifyingSignals,
  shouldShowHomeGuidingLight,
} from '@/signals/reelyouSignalEngine';
import { navigateReelyouSignal } from '@/signals/navigateReelyouSignal';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeGuidingLightSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

const CARD = {
  radius: 16,
  pad: 12,
  iconCircle: 34,
  gap: 11,
} as const;

function HomeGuidingLightSectionComponent({ animatedStyle }: HomeGuidingLightSectionProps) {
  const router = useRouter();
  const { signals, presentHomeSignal, dismissHomePresentation } = useReelyouConnect();
  const { dismissGuidingLight } = useOnboarding();
  const qualifyingSignals = useMemo(() => guidingLightQualifyingSignals(signals), [signals]);
  const showGuidingLight = shouldShowHomeGuidingLight(signals);
  const primarySignal = qualifyingSignals[0];

  const signalIds = useMemo(
    () => qualifyingSignals.map((signal) => signal.signalId),
    [qualifyingSignals],
  );

  const handleDismissGuidingLight = useCallback(() => {
    dismissHomePresentation(signalIds);
    dismissGuidingLight();
  }, [dismissGuidingLight, dismissHomePresentation, signalIds]);

  const handleOpenGuidingLight = useCallback(() => {
    if (!primarySignal) return;
    presentHomeSignal(primarySignal);
    navigateReelyouSignal(router, primarySignal);
  }, [presentHomeSignal, primarySignal, router]);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        width: '100%',
      },
      shell: {
        borderRadius: CARD.radius,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(232, 200, 114, 0.2)',
        backgroundColor: HomePalette.navyMid,
        paddingTop: 4,
        paddingRight: 36,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 6,
          },
          android: { elevation: 2 },
          default: {},
        }),
      },
      topSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '36%',
      },
      inner: {
        padding: CARD.pad,
        gap: 8,
      },
      mainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: CARD.gap,
      },
      iconCircle: {
        width: CARD.iconCircle,
        height: CARD.iconCircle,
        borderRadius: CARD.iconCircle / 2,
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(232, 200, 114, 0.32)',
        backgroundColor: 'rgba(232, 200, 114, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      icon: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        color: tokens.gold,
      },
      center: {
        flex: 1,
        gap: 3,
        paddingTop: 1,
        minWidth: 0,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 15.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.12,
      },
      body: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
      },
      peace: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 16,
        color: 'rgba(235, 228, 248, 0.62)',
      },
      actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        paddingLeft: CARD.iconCircle + CARD.gap,
      },
      companionLink: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: 'rgba(235, 228, 248, 0.55)',
        minHeight: 44,
        lineHeight: 44,
      },
      pressed: { opacity: 0.9 },
    }),
  );

  if (!showGuidingLight || !primarySignal) {
    return null;
  }

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <HomeDismissibleSignalCard
        onDismiss={handleDismissGuidingLight}
        dismissAccessibilityLabel="Dismiss Guiding Light"
      >
        <View style={styles.shell}>
          <LinearGradient
            colors={['rgba(10, 10, 28, 0.97)', 'rgba(6, 8, 20, 0.98)', 'rgba(8, 8, 24, 0.97)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(232, 200, 114, 0.06)', 'transparent', 'rgba(124, 92, 191, 0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.04)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
            style={styles.topSheen}
            pointerEvents="none"
          />

          <View style={styles.inner}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Guiding Light"
              onPress={handleOpenGuidingLight}
              style={({ pressed }) => [styles.mainRow, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>✦</Text>
              </View>
              <View style={styles.center}>
                <Text style={styles.title}>{GuidingLightCopy.sectionTitle}</Text>
                <Text style={styles.body}>{primarySignal.title}</Text>
                {primarySignal.description ? (
                  <Text style={styles.peace}>{primarySignal.description}</Text>
                ) : null}
              </View>
            </Pressable>

            <View style={styles.actionRow}>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={GuidingLightCopy.companionA11y}
                onPress={() => router.push('/companion' as never)}
              >
                <Text style={styles.companionLink}>{GuidingLightCopy.companionLink}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </HomeDismissibleSignalCard>
    </Animated.View>
  );
}

export const HomeGuidingLightSection = memo(HomeGuidingLightSectionComponent);
