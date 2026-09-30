import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { PeopleYouMayKnowSuggestion } from '@/friendDiscovery/friendDiscoveryTypes';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import { isFollowingSkyUser } from '@/social/skyFollow/skyFollowLogic';

interface PeopleYouMayKnowRowProps {
  suggestion: PeopleYouMayKnowSuggestion;
  onDismiss: (userId: string) => void;
}

export function PeopleYouMayKnowRow({ suggestion, onDismiss }: PeopleYouMayKnowRowProps) {
  const router = useRouter();
  const { skyFollowGraph, followSky } = useReelyouConnect();
  const profile = resolvePublicSkyOwnerProfile(suggestion.userId, 'none');
  if (!profile) return null;

  const following = isFollowingSkyUser(skyFollowGraph, currentUser.id, suggestion.userId);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.identity}
        onPress={() => router.push(buildVisitorProfileHref(suggestion.userId) as never)}
        accessibilityRole="button">
        <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
          <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.reason}>{suggestion.reasonLabel}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        {following ? (
          <Text style={styles.followingLabel}>Following</Text>
        ) : (
          <Pressable
            style={styles.followBtn}
            onPress={() => followSky(suggestion.userId)}
            accessibilityLabel={`Follow ${profile.name}'s Sky`}>
            <Text style={styles.followText}>Follow Sky</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onDismiss(suggestion.userId)}
          accessibilityLabel="Dismiss suggestion"
          hitSlop={8}>
          <Text style={styles.dismiss}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(232, 200, 114, 0.15)',
  },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0D1F',
  },
  copy: { flex: 1, gap: 2 },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  reason: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.6)',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  followText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
  },
  followingLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.55)',
  },
  dismiss: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248,244,236,0.35)',
    paddingHorizontal: 4,
  },
});
