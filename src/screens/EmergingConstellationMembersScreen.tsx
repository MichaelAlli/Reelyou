import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { CAREER_TRANSITION_MEMBER_FIXTURES } from '@/emergingConstellations/communitySocialFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationMembersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { messages, canMessageUser, openOrCreateThreadWith } = useReelyouConnect();
  const blockedUserIds = messages.blockedUserIds;
  const limitedUserIds = messages.limitedUserIds;
  const { resolveConstellation, membershipFor } = useEmergingConstellations();

  const constellation = useMemo(() => resolveConstellation(id ?? null), [id, resolveConstellation]);
  const joined = constellation ? membershipFor(constellation.id)?.status === 'joined' : false;

  const members = useMemo(() => {
    return [...CAREER_TRANSITION_MEMBER_FIXTURES]
      .filter((entry) => !blockedUserIds.includes(entry.userId))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [blockedUserIds]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else if (constellation) {
      router.replace(`/emerging-constellation?id=${encodeURIComponent(constellation.id)}` as never);
    } else router.replace('/(tabs)/home' as never);
  }, [constellation, router]);

  if (!constellation || !joined) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>Members are available after you join.</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.sub}>People in {constellation.name} — no ranks, just presence.</Text>

          {members.map((member) => {
            const isSelf = member.userId === currentUser.id;
            const limited = limitedUserIds.includes(member.userId);
            return (
              <View key={member.userId} style={styles.row}>
                <Pressable
                  style={styles.rowMain}
                  disabled={isSelf}
                  onPress={() =>
                    router.push(buildVisitorProfileHref(member.userId) as never)
                  }>
                  <Text style={styles.name}>{isSelf ? `${member.displayName} (you)` : member.displayName}</Text>
                  {limited ? <Text style={styles.limited}>Limited connection</Text> : null}
                </Pressable>
                {!isSelf && canMessageUser(member.userId) ? (
                  <Pressable
                    onPress={() => {
                      const threadId = openOrCreateThreadWith(member.userId);
                      if (threadId) {
                        router.push(`/messages/${threadId}` as never);
                      }
                    }}>
                    <Text style={styles.message}>Message</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: { fontFamily: Fonts.serif, fontSize: 26, color: '#FFF8F0', marginTop: 8 },
  sub: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, color: 'rgba(248,244,236,0.62)', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(232,200,114,0.12)',
  },
  rowMain: { flex: 1 },
  name: { fontFamily: Fonts.sans, fontSize: 15, color: '#FFF8F0' },
  limited: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(248,244,236,0.45)', marginTop: 2 },
  message: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: '#C4B5FD' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
