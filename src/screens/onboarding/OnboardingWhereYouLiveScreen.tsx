/**
 * ONBOARDING 02 — Where You Live in the Sky (functional layer on shared onboarding shell).
 */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AddCustomSkyAreaInline } from '@/components/skyAreas/AddCustomSkyAreaInline';
import { SkyAreaSelectChip } from '@/components/skyAreas/SkyAreaSelectChip';
import {
  OnboardingBackButton,
  OnboardingBrandHeader,
  OnboardingPrimaryButton,
  OnboardingScreenShell,
} from '@/components/onboarding';
import { OnboardingWhereYouLiveCopy } from '@/constants/onboardingWhereYouLiveCopy';
import {
  onboardingTitleShadow,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';
import { ReelyouMotion } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';

export function OnboardingWhereYouLiveScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { markStep } = useOnboarding();
  const { filterCatalog, isAreaSelected, toggleAreaSelection, setDiscovering, record, addCustomArea } =
    useSkyAreaPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);

  const logoWidth = Math.min(width * 0.78, OnboardingProfileLayout.logoWidthMax);

  const visibleAreas = useMemo(
    () => filterCatalog(searchQuery),
    [filterCatalog, searchQuery],
  );

  const discoveringActive = record.stillDiscovering;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      foregroundOpacity.value = 1;
      foregroundTranslateY.value = 0;
      return;
    }
    foregroundOpacity.value = withTiming(1, { duration: ReelyouMotion.fadeIn });
    foregroundTranslateY.value = withTiming(0, { duration: ReelyouMotion.slide });
  }, [foregroundOpacity, foregroundTranslateY, reduceMotion]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/onboarding/north-star' as never);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  const foregroundStyle = useAnimatedStyle(() => ({
    opacity: foregroundOpacity.value,
    transform: [{ translateY: foregroundTranslateY.value }],
  }));

  const finish = useCallback(
    (status: 'completed' | 'skipped') => {
      setIsSubmitting(true);
      markStep('whereYouLive', status);
      setTimeout(() => {
        setIsSubmitting(false);
        router.replace('/process' as never);
      }, 280);
    },
    [markStep, router],
  );

  const handleContinue = useCallback(() => {
    finish('completed');
  }, [finish]);

  const handleSkip = useCallback(() => {
    finish('skipped');
  }, [finish]);

  const handleDiscovering = useCallback(() => {
    setDiscovering(true);
    finish('completed');
  }, [finish, setDiscovering]);

  const titleShadow = onboardingTitleShadow();

  return (
    <OnboardingScreenShell
      leadingAccessory={
        <OnboardingBackButton onPress={handleBack} accessibilityLabel="Go back to North Star" />
      }>
      <Animated.View style={[foregroundStyle, styles.flex]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <OnboardingBrandHeader logoWidth={logoWidth} />

          <View style={styles.promptBlock}>
            <Text style={[styles.title, titleShadow]}>{OnboardingWhereYouLiveCopy.title}</Text>
            <Text style={styles.supporting}>{OnboardingWhereYouLiveCopy.supporting}</Text>
            <Text style={styles.hint}>{OnboardingWhereYouLiveCopy.hint}</Text>
            <Text style={styles.changeAnytime}>{OnboardingWhereYouLiveCopy.changeAnytime}</Text>
          </View>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={OnboardingWhereYouLiveCopy.searchPlaceholder}
            placeholderTextColor="rgba(235,228,248,0.45)"
            style={styles.search}
            accessibilityLabel={OnboardingWhereYouLiveCopy.searchPlaceholder}
          />

          <Text style={styles.sectionLabel}>{OnboardingWhereYouLiveCopy.suggestedAreas}</Text>
          <Text style={styles.softHint}>{OnboardingWhereYouLiveCopy.softSelectionHint}</Text>

          <View style={styles.chipGrid}>
            {visibleAreas.map((area) => (
              <SkyAreaSelectChip
                key={area.id}
                area={area}
                selected={!discoveringActive && isAreaSelected(area.id)}
                onPress={() => {
                  if (discoveringActive) {
                    setDiscovering(false);
                  }
                  toggleAreaSelection(area.id);
                }}
              />
            ))}
          </View>

          <AddCustomSkyAreaInline
            onAdd={(label) => {
              const result = addCustomArea(label);
              return result.error;
            }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <OnboardingPrimaryButton
            label={OnboardingWhereYouLiveCopy.continue}
            onPress={handleContinue}
            loading={isSubmitting}
            variant="gradient"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={OnboardingWhereYouLiveCopy.discovering}
            onPress={handleDiscovering}
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.secondaryLabel}>{OnboardingWhereYouLiveCopy.discovering}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={OnboardingWhereYouLiveCopy.skip}
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.85 }]}>
            <Text style={styles.skipLabel}>{OnboardingWhereYouLiveCopy.skip}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </OnboardingScreenShell>
  );
}

const layout = OnboardingProfileLayout;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  promptBlock: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: layout.titleColor,
    textAlign: 'center',
  },
  supporting: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: layout.subtitleColor,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.65)',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  changeAnytime: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    color: layout.goldAccent,
    textAlign: 'center',
  },
  search: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: layout.chipBorder,
    backgroundColor: 'rgba(8,12,22,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: layout.titleColor,
  },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(235,228,248,0.72)',
    textAlign: 'center',
    marginTop: 4,
  },
  softHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.5)',
    textAlign: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  footer: {
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  secondaryButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13.5,
    fontWeight: '600',
    color: layout.goldAccent,
    textAlign: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  skipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(235,228,248,0.55)',
    textAlign: 'center',
  },
});
