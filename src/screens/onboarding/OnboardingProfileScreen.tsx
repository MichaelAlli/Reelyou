/**
 * REELYOU Onboarding Screen 1 v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | DESIGN LOCKED | READY FOR ONBOARDING FLOW
 * Git rollback tag: "Onboarding Screen 1 v1.0 Design Lock"
 *
 * Visual design is frozen. Only functional, accessibility, responsive,
 * keyboard, safe-area, validation, persistence, integration, and loading/error changes allowed.
 */
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  OnboardingInfoDisclosure,
  OnboardingInterestChip,
  OnboardingPrimaryButton,
  OnboardingScreenShell,
} from '@/components/onboarding';
import { BrandingAssets } from '@/constants/branding';
import { ONBOARDING_INTEREST_ROWS } from '@/constants/onboardingInterests';
import { OnboardingProfileCopy } from '@/constants/onboardingProfileCopy';
import {
  onboardingTitleShadow,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';
import { ReelyouMotion } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';

export function OnboardingProfileScreen() {
  const { width } = useWindowDimensions();
  const { profile, toggleInterest, isInterestSelected, canSelectMore } = useOnboarding();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const foregroundOpacity = useSharedValue(0);
  const foregroundTranslateY = useSharedValue(12);

  const logoWidth = Math.min(width * 0.78, OnboardingProfileLayout.logoWidthMax);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
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
    foregroundTranslateY.value = withTiming(0, { duration: ReelyouMotion.fadeIn });
  }, [foregroundOpacity, foregroundTranslateY, reduceMotion]);

  const foregroundStyle = useAnimatedStyle(() => ({
    opacity: foregroundOpacity.value,
    transform: [{ translateY: foregroundTranslateY.value }],
  }));

  const saveAndAdvance = useCallback(
    (options?: { allowEmpty?: boolean }) => {
      setValidationError(null);
      setSavedMessage(null);

      if (!options?.allowEmpty && profile.interests.length === 0) {
        setValidationError(OnboardingProfileCopy.validationSelectOne);
        return;
      }

      setIsSubmitting(true);

      // TODO: secure persistence + navigation to onboarding screen 2 when route exists.
      setTimeout(() => {
        setIsSubmitting(false);
        setSavedMessage(OnboardingProfileCopy.savedPlaceholder);
      }, 400);
    },
    [profile.interests.length],
  );

  const handleContinue = useCallback(() => {
    saveAndAdvance();
  }, [saveAndAdvance]);

  const handleSkip = useCallback(() => {
    saveAndAdvance({ allowEmpty: true });
  }, [saveAndAdvance]);

  return (
    <OnboardingScreenShell>
      <Animated.View style={foregroundStyle}>
        <View style={styles.logoWrap}>
          <Image
            source={BrandingAssets.logoNightSignUp}
            style={{ width: logoWidth, height: logoWidth * OnboardingProfileLayout.logoAspect }}
            contentFit="contain"
            accessibilityLabel="REELYOU"
          />
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.welcomeTitle}>{OnboardingProfileCopy.welcomeTitle}</Text>
          <Text style={styles.welcomeSubtitle}>{OnboardingProfileCopy.welcomeSubtitle}</Text>
        </View>

        <View style={styles.questionBlock}>
          <Text style={styles.question}>{OnboardingProfileCopy.interestsQuestion}</Text>
          <Text style={styles.hint}>{OnboardingProfileCopy.interestsHint}</Text>
          <Text style={styles.personalizationNote}>{OnboardingProfileCopy.personalizationNote}</Text>
          <OnboardingInfoDisclosure linkLabel={OnboardingProfileCopy.infoLink} />
        </View>

        <View
          style={styles.grid}
          accessibilityRole="none"
          accessibilityLabel="Interest options. Choose up to five.">
          {ONBOARDING_INTEREST_ROWS.map(([left, right]) => (
            <View key={`${left.id}-${right.id}`} style={styles.gridRow}>
              <OnboardingInterestChip
                option={left}
                selected={isInterestSelected(left.id)}
                disabled={!isInterestSelected(left.id) && !canSelectMore}
                onPress={() => {
                  setValidationError(null);
                  toggleInterest(left.id);
                }}
                style={styles.gridChip}
              />
              <OnboardingInterestChip
                option={right}
                selected={isInterestSelected(right.id)}
                disabled={!isInterestSelected(right.id) && !canSelectMore}
                onPress={() => {
                  setValidationError(null);
                  toggleInterest(right.id);
                }}
                style={styles.gridChip}
              />
            </View>
          ))}
        </View>

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        {savedMessage ? (
          <Text accessibilityLiveRegion="polite" style={styles.savedMessage}>
            {savedMessage}
          </Text>
        ) : null}

        <View style={styles.ctaBlock}>
          <OnboardingPrimaryButton
            label={OnboardingProfileCopy.continue}
            onPress={handleContinue}
            disabled={profile.interests.length === 0}
            loading={isSubmitting}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={OnboardingProfileCopy.skip}
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.82 }]}>
          <Text style={styles.skipLabel}>{OnboardingProfileCopy.skip}</Text>
        </Pressable>
      </Animated.View>
    </OnboardingScreenShell>
  );
}

const layout = OnboardingProfileLayout;
const titleShadow = onboardingTitleShadow();

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
    marginBottom: layout.logoBottomGap,
  },
  headingBlock: {
    alignItems: 'center',
    gap: layout.headingGap,
    marginBottom: layout.sectionGap,
  },
  welcomeTitle: {
    fontFamily: Fonts.sans,
    fontSize: layout.titleSize,
    fontWeight: '700',
    color: layout.titleColor,
    textAlign: 'center',
    letterSpacing: 0.2,
    ...titleShadow,
  },
  welcomeSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: layout.subtitleSize,
    lineHeight: 20,
    fontWeight: '400',
    color: layout.subtitleColor,
    textAlign: 'center',
  },
  questionBlock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: layout.sectionGap,
  },
  question: {
    fontFamily: Fonts.sans,
    fontSize: layout.questionSize,
    fontWeight: '700',
    color: layout.titleColor,
    textAlign: 'center',
    ...titleShadow,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: layout.hintSize,
    lineHeight: 18,
    color: layout.hintColor,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  personalizationNote: {
    fontFamily: Fonts.sans,
    fontSize: layout.hintSize,
    lineHeight: 18,
    color: layout.hintColor,
    textAlign: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  grid: {
    gap: layout.chipGap,
  },
  gridRow: {
    flexDirection: 'row',
    gap: layout.chipGap,
  },
  gridChip: {
    flex: 1,
  },
  error: {
    marginTop: 10,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: layout.errorColor,
    textAlign: 'center',
  },
  savedMessage: {
    marginTop: 10,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: layout.subtitleColor,
    textAlign: 'center',
  },
  ctaBlock: {
    marginTop: layout.ctaTopGap,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: layout.skipTopGap,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: layout.goldAccent,
    textAlign: 'center',
  },
});
