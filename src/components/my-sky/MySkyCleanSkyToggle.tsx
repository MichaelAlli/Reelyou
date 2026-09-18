import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ImmersiveGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyImmersiveRestoreButton } from '@/components/my-sky/MySkyImmersiveRestoreButton';
import { MySkyLabeledControl } from '@/components/my-sky/MySkyLabeledControl';
import { MySkyCopy } from '@/constants/mySkyCopy';

interface MySkyCleanSkyToggleProps {
  active: boolean;
  onToggle: () => void;
  floating?: boolean;
  compact?: boolean;
}

function MySkyCleanSkyToggleComponent({
  active,
  onToggle,
  floating = false,
  compact = false,
}: MySkyCleanSkyToggleProps) {
  if (floating) {
    return (
      <View style={styles.floating}>
        <MySkyImmersiveRestoreButton onPress={onToggle} />
      </View>
    );
  }

  const label = compact ? MySkyCopy.cleanSkyCompactLabel : MySkyCopy.cleanSkyOn;

  return (
    <MySkyLabeledControl
      icon={
        compact ? (
          <ImmersiveGlyph size={14} color={MySkyControlColors.iconDefault} strokeWidth={1.65} />
        ) : undefined
      }
      label={label}
      active={active}
      onPress={onToggle}
      accessibilityLabel={active ? MySkyCopy.cleanSkyOff : MySkyCopy.cleanSkyOn}
      accessibilityState={{ selected: active }}
    />
  );
}

export const MySkyCleanSkyToggle = memo(MySkyCleanSkyToggleComponent);

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 4,
  },
});
