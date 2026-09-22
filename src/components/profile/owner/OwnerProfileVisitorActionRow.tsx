import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OWNER_PROFILE_HORIZONTAL_INSET } from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';

interface OwnerProfileVisitorActionRowProps {
  isFollowing: boolean;
  canMessage: boolean;
  onFollowPress: () => void;
  onMessagePress: () => void;
}

function OwnerProfileVisitorActionRowComponent({
  isFollowing,
  canMessage,
  onFollowPress,
  onMessagePress,
}: OwnerProfileVisitorActionRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFollowing ? 'Unfollow Sky' : 'Follow Sky'}
        onPress={onFollowPress}
        style={({ pressed }) => [styles.follow, isFollowing && styles.followActive, pressed && styles.pressed]}>
        <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
          {isFollowing ? 'Following' : 'Follow Sky'}
        </Text>
      </Pressable>
      {canMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Message"
          onPress={onMessagePress}
          style={({ pressed }) => [styles.message, pressed && styles.pressed]}>
          <Text style={styles.messageText}>Message</Text>
        </Pressable>
      ) : (
        <View style={[styles.message, styles.messageDisabled]} pointerEvents="none">
          <Text style={styles.messageTextDisabled}>Message</Text>
        </View>
      )}
    </View>
  );
}

export const OwnerProfileVisitorActionRow = memo(OwnerProfileVisitorActionRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 10,
    marginBottom: 0,
  },
  follow: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.42)',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    borderColor: 'rgba(196, 168, 255, 0.45)',
  },
  followText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
  followTextActive: {
    color: '#F3E8FF',
  },
  message: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.38)',
    backgroundColor: 'rgba(10, 14, 34, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageDisabled: {
    opacity: 0.45,
  },
  messageText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  messageTextDisabled: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(248, 244, 236, 0.55)',
  },
  pressed: {
    opacity: 0.88,
  },
});
