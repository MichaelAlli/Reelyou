import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { Fonts, Radius } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/theme/useTheme';

interface MySkyLabeledControlProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityRole?: 'button' | 'switch';
  accessibilityState?: { selected?: boolean; checked?: boolean; expanded?: boolean };
  icon?: ReactNode;
}

/** Labeled control chip — icon + label always visible; active glow on both. */
function MySkyLabeledControlComponent({
  label,
  active = false,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  icon,
}: MySkyLabeledControlProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        minHeight: 36,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: Radius.full,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 10,
      },
      iconWrap: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  const chipActiveStyle = active
    ? {
        borderWidth: 1,
        borderColor: MySkyControlColors.goldBorderActive,
        backgroundColor: MySkyControlColors.goldBgActive,
        shadowColor: tokens.gold,
        shadowOpacity: 0.42,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
      }
    : {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: MySkyControlColors.neutralBorder,
        backgroundColor: MySkyControlColors.neutralBg,
      };

  const labelActiveStyle = active
    ? {
        fontWeight: '700' as const,
        color: MySkyControlColors.labelActive,
        textShadowColor: 'rgba(255, 213, 122, 0.35)',
        textShadowRadius: 4,
        textShadowOffset: { width: 0, height: 0 },
      }
    : {
        fontWeight: '600' as const,
        color: MySkyControlColors.labelDefault,
      };

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        chipActiveStyle,
        pressed && {
          borderColor: MySkyControlColors.goldBorder,
          backgroundColor: active ? MySkyControlColors.goldBgActive : 'rgba(16, 14, 32, 0.82)',
        },
      ]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[styles.label, labelActiveStyle]}>{label}</Text>
    </Pressable>
  );
}

export const MySkyLabeledControl = memo(MySkyLabeledControlComponent);
