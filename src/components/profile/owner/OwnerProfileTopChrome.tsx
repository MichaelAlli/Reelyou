import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerProfileChromeButton } from '@/components/profile/owner/OwnerProfileChromeButton';
import { OWNER_PROFILE_HORIZONTAL_INSET } from '@/components/profile/owner/ownerProfileLayout';

interface OwnerProfileTopChromeProps {
  onBack: () => void;
  onShare?: () => void;
  onOverflow?: () => void;
  /** Visitor profile — back only at top-left. */
  variant?: 'owner' | 'visitor';
}

function OwnerProfileTopChromeComponent({
  onBack,
  onShare,
  onOverflow,
  variant = 'owner',
}: OwnerProfileTopChromeProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: Math.max(insets.top, 6) }]}>
      <OwnerProfileChromeButton accessibilityLabel="Go back" onPress={onBack} glyph="←" />
      {variant === 'owner' ? (
        <View style={styles.rightCluster}>
          <OwnerProfileChromeButton accessibilityLabel="Share profile" onPress={onShare} glyph="↗" />
          <OwnerProfileChromeButton accessibilityLabel="More options" onPress={onOverflow} glyph="⋮" />
        </View>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </View>
  );
}

export const OwnerProfileTopChrome = memo(OwnerProfileTopChromeComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    paddingBottom: 0,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightSpacer: {
    width: 40,
  },
});
