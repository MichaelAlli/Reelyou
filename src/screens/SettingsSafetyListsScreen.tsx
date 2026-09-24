import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { SkyFriendsCopy } from '@/constants/skyFriendsCopy';
import { Fonts } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';

function nameFor(userId: string): string {
  if (userId === currentUser.id) return currentUser.name;
  return orbitUsers.find((u) => u.id === userId)?.name ?? userId;
}

interface SettingsSafetyListsScreenProps {
  mode: 'blocked' | 'limited';
}

export function SettingsSafetyListsScreen({ mode }: SettingsSafetyListsScreenProps) {
  const router = useRouter();
  const { messages, unblockUser, removeLimitUser } = useReelyouConnect();
  const ids = mode === 'blocked' ? messages.blockedUserIds : messages.limitedUserIds;
  const title = mode === 'blocked' ? SkyFriendsCopy.blockedTitle : SkyFriendsCopy.limitedTitle;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {ids.length === 0 ? (
          <Text style={styles.empty}>No one here.</Text>
        ) : (
          ids.map((userId) => (
            <View key={userId} style={styles.row}>
              <Text style={styles.name}>{nameFor(userId)}</Text>
              <Pressable
                onPress={() =>
                  mode === 'blocked' ? unblockUser(userId) : removeLimitUser(userId)
                }
                style={styles.action}>
                <Text style={styles.actionText}>
                  {mode === 'blocked' ? SkyFriendsCopy.unblock : SkyFriendsCopy.removeLimit}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 20 },
  spacer: { width: 48 },
  content: { padding: 16, gap: 10 },
  empty: { fontFamily: Fonts.sans, color: 'rgba(235,228,248,0.65)', textAlign: 'center', marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  name: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#F5F0FF', flex: 1 },
  action: { paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: '#E8C872' },
});
