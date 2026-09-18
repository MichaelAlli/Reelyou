import { memo } from 'react';

import { ExploreGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyLabeledControl } from '@/components/my-sky/MySkyLabeledControl';
import { MySkyCopy } from '@/constants/mySkyCopy';

interface MySkyExploreToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function MySkyExploreToggleComponent({ enabled, onChange }: MySkyExploreToggleProps) {
  const iconColor = enabled ? MySkyControlColors.iconActive : MySkyControlColors.iconMuted;

  return (
    <MySkyLabeledControl
      icon={<ExploreGlyph size={16} color={iconColor} active={enabled} strokeWidth={enabled ? 1.35 : 1.2} />}
      label={MySkyCopy.exploreToggleLabel}
      active={enabled}
      accessibilityRole="button"
      accessibilityState={{ selected: enabled }}
      accessibilityLabel={
        enabled ? MySkyCopy.exploreToggleAccessibilityOn : MySkyCopy.exploreToggleAccessibilityOff
      }
      onPress={() => onChange(!enabled)}
    />
  );
}

export const MySkyExploreToggle = memo(MySkyExploreToggleComponent);
