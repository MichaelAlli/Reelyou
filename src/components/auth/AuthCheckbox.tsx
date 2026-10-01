import { type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from 'react-native';

import { AuthIcon } from '@/components/auth/AuthIcon';
import { SignUpDayLayout, signUpDayTextReadabilityShadow } from '@/constants/signUpDayLayout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';
import { useTheme, useThemedStyles } from '@/theme';

const CHECKBOX_HIT = 44;

type AuthCheckboxLegalProps = {
  labelPrefix: string;
  termsLabel: string;
  onTermsPress: () => void;
  labelMiddle: string;
  privacyLabel: string;
  onPrivacyPress: () => void;
  linkStyle: TextStyle;
  label?: never;
};

type AuthCheckboxSimpleProps = {
  label: ReactNode;
  labelPrefix?: never;
  termsLabel?: never;
  onTermsPress?: never;
  labelMiddle?: never;
  privacyLabel?: never;
  onPrivacyPress?: never;
  linkStyle?: never;
};

type AuthCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  error?: string;
} & (AuthCheckboxLegalProps | AuthCheckboxSimpleProps);

export function AuthCheckbox(props: AuthCheckboxProps) {
  const { checked, onToggle, error } = props;
  const isLegal = 'termsLabel' in props && props.termsLabel != null;
  const { tokens } = useTheme();
  const isLight = useAuthAppearance();
  const day = SignUpDayLayout;
  const textLift = signUpDayTextReadabilityShadow();

  const checkedFill = day.goldAccent;
  const checkmarkColor = day.navyText;
  const uncheckedBorder = isLight ? day.navyBorder : 'rgba(248, 249, 252, 0.45)';

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      },
      checkboxPressable: {
        width: CHECKBOX_HIT,
        height: CHECKBOX_HIT,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: isLegal ? 0 : -3,
      },
      box: {
        width: 22,
        height: 22,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      labelPressable: {
        flex: 1,
        minHeight: CHECKBOX_HIT,
        justifyContent: 'center',
        paddingVertical: isLegal ? 10 : 12,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: 0.02,
        color: isLight ? day.legalTextColor : tokens.primaryText,
        ...textLift,
        ...(Platform.OS === 'web'
          ? ({ WebkitFontSmoothing: 'antialiased' } as object)
          : null),
      },
      link: {
        ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
      },
      errorSlot: {
        minHeight: 16,
        marginTop: Spacing.two,
        paddingLeft: CHECKBOX_HIT + 8,
        justifyContent: 'center',
      },
      error: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: '#C24141',
      },
    }),
  );

  const handleCheckboxKeyPress = (event: { nativeEvent: { key: string } }) => {
    const key = event.nativeEvent.key;
    if (key === ' ' || key === 'Enter') {
      onToggle();
    }
  };

  const accessibilityLabel = isLegal
    ? `${props.labelPrefix}${props.termsLabel}${props.labelMiddle}${props.privacyLabel}`
    : typeof props.label === 'string'
      ? props.label
      : 'Checkbox';

  const openTerms = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    if (isLegal) props.onTermsPress();
  };

  const openPrivacy = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    if (isLegal) props.onPrivacyPress();
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={accessibilityLabel}
          hitSlop={8}
          onPress={onToggle}
          {...(Platform.OS === 'web'
            ? ({ onKeyPress: handleCheckboxKeyPress, focusable: true } as object)
            : null)}
          style={({ pressed }) => [styles.checkboxPressable, pressed && { opacity: 0.9 }]}>
          <View
            style={[
              styles.box,
              {
                borderColor: error ? '#C24141' : checked ? checkedFill : uncheckedBorder,
                backgroundColor: checked ? checkedFill : 'transparent',
              },
            ]}
            pointerEvents="none">
            {checked ? (
              <AuthIcon name="checkmark" size={13} color={checkmarkColor} />
            ) : null}
          </View>
        </Pressable>

        {isLegal ? (
          <View style={styles.labelPressable} accessible={false} importantForAccessibility="no-hide-descendants">
            <Text style={styles.label}>
              <Text onPress={onToggle} suppressHighlighting>
                {props.labelPrefix}
              </Text>
              <Text
                accessibilityRole="link"
                onPress={openTerms}
                style={[props.linkStyle, styles.link]}
                suppressHighlighting>
                {props.termsLabel}
              </Text>
              <Text onPress={onToggle} suppressHighlighting>
                {props.labelMiddle}
              </Text>
              <Text
                accessibilityRole="link"
                onPress={openPrivacy}
                style={[props.linkStyle, styles.link]}
                suppressHighlighting>
                {props.privacyLabel}
              </Text>
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="none"
            onPress={onToggle}
            style={styles.labelPressable}>
            <Text style={styles.label}>{props.label}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.errorSlot}>{error ? <Text style={styles.error}>{error}</Text> : null}</View>
    </View>
  );
}
