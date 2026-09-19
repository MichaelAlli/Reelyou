import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import {
  SKY_VISIBILITY_ICONS,
  type SkyVisibilityLevel,
} from '@/mySky/skyVisibilitySettings';

interface MySkyVisibilityBadgeProps {
  visibility: SkyVisibilityLevel;
  compact?: boolean;
}

/** Lightweight owner-only indicator — lock / people / globe. */
function MySkyVisibilityBadgeComponent({
  visibility,
  compact = false,
}: MySkyVisibilityBadgeProps) {
  if (visibility === 'public') return null;

  return (
    <View style={[styles.badge, compact && styles.badgeCompact]} pointerEvents="none">
      <Text style={[styles.icon, compact && styles.iconCompact]}>
        {SKY_VISIBILITY_ICONS[visibility]}
      </Text>
    </View>
  );
}

export const MySkyVisibilityBadge = memo(MySkyVisibilityBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 26, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  badgeCompact: {
    minWidth: 12,
    height: 12,
    borderRadius: 6,
    top: -1,
    right: -3,
  },
  icon: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    lineHeight: 10,
  },
  iconCompact: {
    fontSize: 7,
    lineHeight: 9,
  },
});
