import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { RestoreGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Radius } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyImmersiveRestoreButtonProps {
  onPress: () => void;
}

/** Icon-only restore — always visibly lit, lifts user out of Clean Sky. */
function MySkyImmersiveRestoreButtonComponent({ onPress }: MySkyImmersiveRestoreButtonProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: MySkyControlColors.goldBorderActive,
        backgroundColor: 'rgba(10, 10, 26, 0.9)',
        shadowColor: tokens.gold,
        shadowOpacity: 0.45,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
      },
      buttonPressed: {
        borderColor: '#FFD57A',
        backgroundColor: 'rgba(232, 200, 114, 0.18)',
        shadowOpacity: 0.55,
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={MySkyCopy.cleanSkyOff}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <RestoreGlyph size={20} color={MySkyControlColors.iconActive} strokeWidth={2.1} />
    </Pressable>
  );
}

export const MySkyImmersiveRestoreButton = memo(MySkyImmersiveRestoreButtonComponent);
