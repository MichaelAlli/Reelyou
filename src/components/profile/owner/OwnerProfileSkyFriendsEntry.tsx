import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
} from '@/components/profile/owner/ownerProfileLayout';
import { SkyFriendsCopy } from '@/constants/skyFriendsCopy';
import { Fonts } from '@/constants/theme';

interface OwnerProfileSkyFriendsEntryProps {
  count: number;
  onPress: () => void;
}

function OwnerProfileSkyFriendsEntryComponent({
  count,
  onPress,
}: OwnerProfileSkyFriendsEntryProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${SkyFriendsCopy.profileEntryTitle}, ${count}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{SkyFriendsCopy.profileEntryTitle}</Text>
          <Text style={styles.sub}>{SkyFriendsCopy.profileEntrySubtitle}</Text>
        </View>
        <Text style={styles.count}>{count}</Text>
      </View>
    </Pressable>
  );
}

export const OwnerProfileSkyFriendsEntry = memo(OwnerProfileSkyFriendsEntryComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 10,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
    backgroundColor: 'rgba(10, 14, 34, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 4 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F0FF',
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235, 228, 248, 0.62)',
  },
  count: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    color: '#E8C872',
  },
});
