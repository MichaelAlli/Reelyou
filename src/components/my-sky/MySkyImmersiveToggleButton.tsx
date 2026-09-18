import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ImmersiveSkyEnterGlyph, ImmersiveSkyExitGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface MySkyImmersiveToggleButtonProps {
  immersiveActive: boolean;
  onPress: () => void;
  floating?: boolean;
}

/** Icon-only immersive / full-sky toggle — always visible, premium glow. */
function MySkyImmersiveToggleButtonComponent({
  immersiveActive,
  onPress,
  floating = false,
}: MySkyImmersiveToggleButtonProps) {
  const { tokens } = useTheme();
  const iconColor = immersiveActive ? MySkyControlColors.iconActive : MySkyControlColors.iconDefault;

  return (
    <View style={floating ? styles.floating : styles.inline}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          immersiveActive ? MySkyCopy.immersiveModeExit : MySkyCopy.immersiveModeEnter
        }
        accessibilityState={{ selected: immersiveActive }}
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          immersiveActive ? styles.buttonActive : styles.buttonDefault,
          {
            shadowColor: tokens.gold,
            shadowOpacity: immersiveActive ? 0.55 : 0.38,
            shadowRadius: immersiveActive ? 12 : 8,
            shadowOffset: { width: 0, height: 0 },
          },
          pressed && styles.buttonPressed,
        ]}>
        {immersiveActive ? (
          <ImmersiveSkyExitGlyph size={22} color={iconColor} strokeWidth={1.65} />
        ) : (
          <ImmersiveSkyEnterGlyph size={22} color={iconColor} strokeWidth={1.55} />
        )}
      </Pressable>
    </View>
  );
}

export const MySkyImmersiveToggleButton = memo(MySkyImmersiveToggleButtonComponent);

const styles = StyleSheet.create({
  inline: {
    flexShrink: 0,
  },
  floating: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 4,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(10, 10, 26, 0.9)',
  },
  buttonDefault: {
    borderColor: MySkyControlColors.goldBorder,
    backgroundColor: 'rgba(10, 10, 26, 0.88)',
  },
  buttonActive: {
    borderColor: MySkyControlColors.goldBorderActive,
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  buttonPressed: {
    borderColor: '#FFD57A',
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
  },
});
