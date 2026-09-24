import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { SkyFriendsCopy } from '@/constants/skyFriendsCopy';
import { Fonts, TabBarHeight } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';
import { resolveSkyRelationship } from '@/social/skyFollow/resolveSkyRelationship';

type TabId = 'friends' | 'following' | 'followers';

function displayName(userId: string): string {
  if (userId === currentUser.id) return currentUser.name;
  return orbitUsers.find((u) => u.id === userId)?.name ?? userId;
}

export function SkyFriendsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('friends');
  const [query, setQuery] = useState('');
  const {
    skyFollowGraph,
    skyFriendsCount,
    skyFriendUserIds,
    listFollowingUserIds,
    listFollowerUserIds,
    followSky,
    unfollowSky,
    blockUser,
    limitUser,
    removeLimitUser,
    messages,
    openOrCreateThreadWith,
    canMessageUser,
  } = useReelyouConnect();

  const userIds = useMemo(() => {
    if (tab === 'friends') return skyFriendUserIds;
    if (tab === 'following') return listFollowingUserIds();
    return listFollowerUserIds();
  }, [listFollowerUserIds, listFollowingUserIds, skyFriendUserIds, tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return userIds;
    return userIds.filter((id) => displayName(id).toLowerCase().includes(q));
  }, [query, userIds]);

  const confirmBlock = (userId: string) => {
    const name = displayName(userId);
    Alert.alert(SkyFriendsCopy.blockConfirmTitle(name), SkyFriendsCopy.blockConfirmBody, [
      { text: SkyFriendsCopy.cancel, style: 'cancel' },
      { text: SkyFriendsCopy.block, style: 'destructive', onPress: () => blockUser(userId) },
    ]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back">
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.title}>{SkyFriendsCopy.screenTitle}</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: TabBarHeight + 24 }]}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.summary}>{SkyFriendsCopy.summaryCount(skyFriendsCount)}</Text>
          <Text style={styles.summaryLine}>{SkyFriendsCopy.summaryLine}</Text>

          <View style={styles.tabs}>
            {(
              [
                ['friends', SkyFriendsCopy.tabFriends],
                ['following', SkyFriendsCopy.tabFollowing],
                ['followers', SkyFriendsCopy.tabFollowers],
              ] as const
            ).map(([id, label]) => (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={[styles.tab, tab === id && styles.tabActive]}>
                <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={SkyFriendsCopy.searchPlaceholder}
            placeholderTextColor="rgba(235,228,248,0.45)"
            style={styles.search}
          />

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {tab === 'friends'
                  ? SkyFriendsCopy.emptyFriendsTitle
                  : tab === 'following'
                    ? SkyFriendsCopy.emptyFollowingTitle
                    : SkyFriendsCopy.emptyFollowersTitle}
              </Text>
              <Text style={styles.emptyBody}>
                {tab === 'friends'
                  ? SkyFriendsCopy.emptyFriendsBody
                  : tab === 'following'
                    ? SkyFriendsCopy.emptyFollowingBody
                    : SkyFriendsCopy.emptyFollowersBody}
              </Text>
            </View>
          ) : (
            filtered.map((userId) => {
              const rel = resolveSkyRelationship(skyFollowGraph, currentUser.id, userId);
              const limited = messages.limitedUserIds.includes(userId);
              return (
                <View key={userId} style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.name} numberOfLines={1}>
                      {displayName(userId)}
                    </Text>
                    <Text style={styles.detail} numberOfLines={2}>
                      {rel.detail ?? rel.label}
                      {limited ? ' · Limited' : ''}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => router.push(`/visitor-profile?ownerId=${userId}` as never)}
                      style={styles.chip}>
                      <Text style={styles.chipText}>{SkyFriendsCopy.viewSky}</Text>
                    </Pressable>
                    {tab === 'followers' && rel.kind === 'follows_you' ? (
                      <Pressable onPress={() => followSky(userId)} style={styles.chipPrimary}>
                        <Text style={styles.chipPrimaryText}>{SkyFriendsCopy.followSky}</Text>
                      </Pressable>
                    ) : null}
                    {rel.kind === 'following' || rel.kind === 'sky_friend' ? (
                      <Pressable onPress={() => unfollowSky(userId)} style={styles.chip}>
                        <Text style={styles.chipText}>{SkyFriendsCopy.unfollow}</Text>
                      </Pressable>
                    ) : null}
                    {canMessageUser(userId) ? (
                      <Pressable
                        onPress={() => {
                          const tid = openOrCreateThreadWith(userId);
                          if (tid) router.push(`/messages/${tid}` as never);
                        }}
                        style={styles.chip}>
                        <Text style={styles.chipText}>{SkyFriendsCopy.message}</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => (limited ? removeLimitUser(userId) : limitUser(userId))}
                      style={styles.chip}>
                      <Text style={styles.chipText}>
                        {limited ? SkyFriendsCopy.removeLimit : SkyFriendsCopy.limit}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => confirmBlock(userId)} style={styles.chipDanger}>
                      <Text style={styles.chipDangerText}>{SkyFriendsCopy.block}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600', width: 56 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#F5F0FF',
  },
  spacer: { width: 56 },
  content: { paddingHorizontal: 16, gap: 12 },
  summary: { fontFamily: Fonts.sans, fontSize: 22, fontWeight: '700', color: '#F5F0FF' },
  summaryLine: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(235,228,248,0.72)',
  },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  tabActive: { backgroundColor: 'rgba(167,139,250,0.18)', borderColor: 'rgba(232,200,114,0.45)' },
  tabText: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.75)' },
  tabTextActive: { color: '#E8C872', fontWeight: '700' },
  search: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#F5F0FF',
    backgroundColor: 'rgba(6,8,22,0.55)',
  },
  row: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.22)',
    backgroundColor: 'rgba(10,14,34,0.55)',
    padding: 12,
    gap: 10,
  },
  rowMain: { gap: 4 },
  name: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#F5F0FF' },
  detail: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.65)' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  chipText: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600', color: '#E8C872' },
  chipPrimary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(232,200,114,0.18)',
  },
  chipPrimaryText: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', color: '#E8C872' },
  chipDanger: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderColor: 'rgba(248,113,113,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipDangerText: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600', color: '#FCA5A5' },
  empty: { paddingVertical: 32, gap: 8, alignItems: 'center' },
  emptyTitle: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', color: '#F5F0FF' },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(235,228,248,0.65)',
    textAlign: 'center',
  },
});
