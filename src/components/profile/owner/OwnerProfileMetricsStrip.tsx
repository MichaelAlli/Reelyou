import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import { OWNER_PROFILE_LEGACY_SUBTITLE } from '@/profile/profileLegacyCopy';
import type { OwnerProfileMetrics } from '@/profile/ownerProfileTypes';

interface OwnerProfileMetricsStripProps {
  metrics: OwnerProfileMetrics;
  onLegacyPress?: () => void;
  legacyPressEnabled?: boolean;
  legacySubtitle?: string;
}

function OwnerProfileMetricsStripComponent({
  metrics,
  onLegacyPress,
  legacyPressEnabled = true,
  legacySubtitle = OWNER_PROFILE_LEGACY_SUBTITLE,
}: OwnerProfileMetricsStripProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.column}>
        <Text style={styles.icon}>♥</Text>
        <Text style={styles.value}>{metrics.livesImpacted}</Text>
        <Text style={styles.label}>Lives Impacted</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.column}>
        <Text style={styles.iconGold}>★</Text>
        <Text style={styles.value}>{metrics.contributionsMade}</Text>
        <Text style={styles.label}>Contributions Made</Text>
      </View>
      <View style={styles.divider} />
      {legacyPressEnabled && onLegacyPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Legacy"
          onPress={onLegacyPress}
          style={({ pressed }) => [styles.column, styles.legacyColumn, pressed && styles.pressed]}>
          <View style={styles.legacyIconWrap}>
            <Text style={styles.legacyIcon}>✦</Text>
          </View>
          <Text style={styles.legacyTitle}>Legacy</Text>
          <Text style={styles.legacySubtitle} numberOfLines={2}>
            {legacySubtitle}
          </Text>
        </Pressable>
      ) : (
        <View style={[styles.column, styles.legacyColumn]}>
          <View style={styles.legacyIconWrap}>
            <Text style={styles.legacyIcon}>✦</Text>
          </View>
          <Text style={styles.legacyTitle}>Legacy</Text>
          <Text style={styles.legacySubtitle} numberOfLines={2}>
            {legacySubtitle}
          </Text>
        </View>
      )}
    </View>
  );
}

export const OwnerProfileMetricsStrip = memo(OwnerProfileMetricsStripComponent);

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: OWNER_PROFILE_SECTION_GAP,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingVertical: 11,
    paddingHorizontal: 4,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  legacyColumn: {
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  divider: {
    alignSelf: 'stretch',
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    marginVertical: 6,
  },
  icon: {
    fontSize: 16,
    color: '#F87171',
  },
  iconGold: {
    fontSize: 16,
    color: '#E8C872',
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF8F0',
    marginTop: 1,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    color: 'rgba(248, 244, 236, 0.72)',
  },
  legacyIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.45)',
  },
  legacyIcon: {
    fontSize: 14,
    color: '#D8C4FF',
  },
  legacyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF8F0',
    marginTop: 2,
  },
  legacySubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    lineHeight: 12,
    textAlign: 'center',
    color: 'rgba(248, 244, 236, 0.68)',
    paddingHorizontal: 2,
  },
});
