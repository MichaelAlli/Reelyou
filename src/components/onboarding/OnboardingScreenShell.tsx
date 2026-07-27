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
import { OnboardingAssets } from '@/constants/onboardingAssets';
import {
  onboardingBackgroundImageStyle,
  onboardingWebViewportStyle,
  OnboardingProfileLayout,
} from '@/constants/onboardingProfileLayout';

interface OnboardingScreenShellProps {
  children: ReactNode;
  contentStyle?: ViewStyle;
}

export function OnboardingScreenShell({ children, contentStyle }: OnboardingScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundImage
      source={OnboardingAssets.profileBackground}
      resizeMode="cover"
      style={StyleSheet.flatten([styles.root, onboardingWebViewportStyle()])}
      imageStyle={onboardingBackgroundImageStyle()}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={styles.flex}>
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={[
              styles.scrollContent,
              {
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: OnboardingProfileLayout.horizontalPadding,
    paddingTop: OnboardingProfileLayout.topInsetMin,
  },
});
