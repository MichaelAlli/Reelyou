import { memo, useCallback, useState } from 'react';
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ONBOARDING_SHARED_BACKGROUND } from '@/constants/onboardingAssets';
import { formatNorthStarCharacterCount, OnboardingNorthStarCopy } from '@/constants/onboardingNorthStarCopy';
import { OnboardingNorthStarLayout } from '@/constants/onboardingNorthStarLayout';
import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { MAX_NORTH_STAR_VISION_LENGTH } from '@/onboarding/northStar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface OnboardingNorthStarInputProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
}

function OnboardingNorthStarInputComponent({
  value,
  onChangeText,
  maxLength = MAX_NORTH_STAR_VISION_LENGTH,
}: OnboardingNorthStarInputProps) {
  const { tokens, isLight } = useTheme();
  const [inputHeight, setInputHeight] = useState<number>(OnboardingNorthStarLayout.inputMinHeight);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const nextHeight = Math.max(
        OnboardingNorthStarLayout.inputMinHeight,
        event.nativeEvent.contentSize.height + OnboardingNorthStarLayout.inputPaddingTop + 28,
      );
      setInputHeight(nextHeight);
    },
    [],
  );

  const showPlaceholder = value.length === 0;

  return (
    <View style={styles.wrap}>
      <ImageBackground
        source={ONBOARDING_SHARED_BACKGROUND}
        resizeMode="cover"
        style={[styles.inputSurface, { minHeight: inputHeight }]}
        imageStyle={styles.inputImage}>
        {showPlaceholder ? (
          <View style={styles.placeholderRow} pointerEvents="none">
            <SymbolView
              name={{ ios: 'sparkle', android: 'star', web: 'star' }}
              size={12}
              tintColor={OnboardingProfileLayout.goldAccent}
              weight="regular"
              style={{ width: 12, height: 12 }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={[styles.placeholder, { color: tokens.placeholderText }]}>
              {OnboardingNorthStarCopy.inputPlaceholder}
            </Text>
          </View>
        ) : null}
        <TextInput
          accessibilityLabel="North Star vision"
          accessibilityHint="Describe your five-year vision. Up to 500 characters."
          multiline
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          onContentSizeChange={handleContentSizeChange}
          style={[
            styles.input,
            {
              minHeight: inputHeight - OnboardingNorthStarLayout.inputPaddingBottom,
              color: isLight ? '#F8F9FC' : tokens.inputText,
            },
          ]}
          placeholder=""
          scrollEnabled={false}
          autoCorrect
          autoCapitalize="sentences"
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <Text
          style={[styles.counter, { color: tokens.placeholderText }]}
          accessibilityLabel={`${value.length} of ${maxLength} characters used`}>
          {formatNorthStarCharacterCount(value.length, maxLength)}
        </Text>
      </ImageBackground>
    </View>
  );
}

export const OnboardingNorthStarInput = memo(OnboardingNorthStarInputComponent);

const layout = OnboardingNorthStarLayout;
const gold = OnboardingProfileLayout.goldAccent;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 14,
  },
  inputSurface: {
    borderRadius: layout.inputRadius,
    borderWidth: layout.inputBorderWidth,
    borderColor: gold,
    overflow: 'hidden',
    backgroundColor: '#050818',
  },
  inputImage: {
    opacity: 0.92,
  },
  placeholderRow: {
    position: 'absolute',
    top: layout.inputPaddingTop,
    left: layout.inputPaddingHorizontal,
    right: layout.inputPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1,
  },
  placeholder: {
    fontFamily: Fonts.sans,
    fontSize: layout.inputFontSize,
    lineHeight: layout.inputLineHeight,
    fontWeight: '400',
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: layout.inputFontSize,
    lineHeight: layout.inputLineHeight,
    fontWeight: '400',
    paddingHorizontal: layout.inputPaddingHorizontal,
    paddingTop: layout.inputPaddingTop,
    paddingBottom: layout.inputPaddingBottom,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
        } as object)
      : null),
  },
  counter: {
    position: 'absolute',
    right: layout.inputPaddingHorizontal,
    bottom: 10,
    fontFamily: Fonts.sans,
    fontSize: layout.counterSize,
    fontWeight: '500',
  },
});
