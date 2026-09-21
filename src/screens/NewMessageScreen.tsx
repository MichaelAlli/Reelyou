import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { Fonts } from '@/constants/theme';

export function NewMessageScreen() {
  const router = useRouter();
  const { searchableUsers, canMessageUser, openOrCreateThreadWith } = useReelyouConnect();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchableUsers.filter(
      (u) => canMessageUser(u.id) && (!q || u.name.toLowerCase().includes(q)),
    );
  }, [canMessageUser, query, searchableUsers]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>New Message</Text>
        <View style={styles.spacer} />
      </View>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search connections"
        placeholderTextColor="rgba(235,228,248,0.4)"
        accessibilityLabel="Search eligible people"
      />
      <ScrollView contentContainerStyle={styles.list}>
        {results.length === 0 ? (
          <Text style={styles.empty}>No eligible people found.</Text>
        ) : (
          results.map((user) => (
            <Pressable
              key={user.id}
              style={styles.row}
              onPress={() => {
                const threadId = openOrCreateThreadWith(user.id);
                if (threadId) router.replace(`/messages/${threadId}` as never);
              }}
              accessibilityLabel={`Message ${user.name}`}
            >
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.label}>{user.label}</Text>
            </Pressable>
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
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 18 },
  spacer: { width: 48 },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    paddingHorizontal: 12,
    minHeight: 44,
    color: '#F5F0FF',
    fontFamily: Fonts.sans,
  },
  list: { padding: 16, gap: 8 },
  empty: { fontFamily: Fonts.sans, color: 'rgba(235,228,248,0.65)', textAlign: 'center', marginTop: 24 },
  row: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167,139,250,0.18)',
    backgroundColor: 'rgba(8,10,28,0.65)',
  },
  name: { fontFamily: Fonts.sans, fontWeight: '600', color: '#F5F0FF' },
  label: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.6)' },
});
