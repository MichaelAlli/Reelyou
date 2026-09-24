import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';

interface VisitorProfileLegacyRippleRowProps {
  onRipplesPress: () => void;
  onReelYouPress: () => void;
}

export function VisitorProfileLegacyRippleRow({
  onRipplesPress,
  onReelYouPress,
}: VisitorProfileLegacyRippleRowProps) {
  return (
    <View style={styles.row}>
      <Entry label="Ripples" onPress={onRipplesPress} />
      <View style={styles.divider} />
      <Entry label="REEL-YOU" onPress={onReelYouPress} />
    </View>
  );
}

function Entry({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 8,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 34, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  entry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 4,
  },
  pressed: { opacity: 0.88 },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.82)',
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.45)',
  },
});
