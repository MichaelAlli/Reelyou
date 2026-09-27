import { memo } from 'react';

import { ConstellationsLineIcon } from '@/components/my-sky/ConstellationsLineIcon';
import { MySkySecondRowChip } from '@/components/my-sky/MySkySecondRowChip';
import { MySkyCopy } from '@/constants/mySkyCopy';

interface MySkyConstellationsControlProps {
  active: boolean;
  onPress: () => void;
}

function MySkyConstellationsControlComponent({
  active,
  onPress,
}: MySkyConstellationsControlProps) {
  return (
    <MySkySecondRowChip
      label={MySkyCopy.constellationsControlLabel}
      accessibilityLabel={MySkyCopy.constellationsControlA11y}
      icon={<ConstellationsLineIcon size={13} />}
      active={active}
      onPress={onPress}
    />
  );
}

export const MySkyConstellationsControl = memo(MySkyConstellationsControlComponent);
