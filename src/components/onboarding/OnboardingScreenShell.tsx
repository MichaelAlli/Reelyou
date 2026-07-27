import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundImage } from '@/components/layout/BackgroundImage';
import { OnboardingAssets, type OnboardingBackgroundKey } from '@/constants/onboardingAssets';
import {
  onboardingBackgroundImageStyle,
  onboardingWebViewportStyle,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';

interface OnboardingScreenShellProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
  backgroundKey?: OnboardingBackgroundKey;
  /** Fixed top-left accessory (e.g. Screen 2 back control). Does not affect Screen 1 layout. */
  leadingAccessory?: ReactNode;
}

/** Shared onboarding shell — Screen 1 and Screen 2 use identical safe-area and margin treatment. */
export function OnboardingScreenShell({
  children,
  contentStyle,
  backgroundKey = 'profileBackground',
  leadingAccessory,
}: OnboardingScreenShellProps) {
  const insets = useSafeAreaInsets();
  const source = OnboardingAssets[backgroundKey];

  return (
    <BackgroundImage
      source={source}
      resizeMode="cover"
      style={StyleSheet.flatten([styles.root, onboardingWebViewportStyle()])}
      imageStyle={onboardingBackgroundImageStyle()}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {leadingAccessory ? (
          <View
            style={[
              styles.leadingAccessory,
              { paddingLeft: Math.max(insets.left, 8) },
            ]}>
            {leadingAccessory}
          </View>
        ) : null}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={styles.flex}>
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: OnboardingProfileLayout.horizontalPadding,
                paddingTop: OnboardingProfileLayout.topInsetMin,
                paddingBottom: insets.bottom + OnboardingProfileLayout.scrollBottomPadding,
              },
              contentStyle,
            ]}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050818',
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  leadingAccessory: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    height: 44,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
