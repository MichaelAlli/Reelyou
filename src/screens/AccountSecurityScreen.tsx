import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePerformSignOut } from '@/auth/usePerformSignOut';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { Fonts } from '@/constants/theme';

export function AccountSecurityScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const signOut = usePerformSignOut();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Account & security</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{auth.user?.email ?? '—'}</Text>
        {auth.user?.fullName ? (
          <>
            <Text style={[styles.label, styles.gap]}>Display name</Text>
            <Text style={styles.value}>{auth.user.fullName}</Text>
          </>
        ) : null}

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/forgot-password' as never)}
          accessibilityRole="button"
          accessibilityLabel="Reset password"
        >
          <Text style={styles.linkText}>Reset password</Text>
        </Pressable>

        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/settings/account-deletion' as never)}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <Text style={styles.destructive}>Delete account</Text>
        </Pressable>

        <Pressable
          style={[styles.linkRow, styles.signOutRow]}
          onPress={() => void signOut()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontFamily: Fonts.sans, fontSize: 15, color: '#C9B896' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    color: '#F8F4EC',
  },
  spacer: { width: 48 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.55)',
    marginTop: 8,
  },
  gap: { marginTop: 20 },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    color: '#F8F4EC',
    marginTop: 4,
  },
  linkRow: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)' },
  linkText: { fontFamily: Fonts.sans, fontSize: 16, color: '#E8C872' },
  destructive: { fontFamily: Fonts.sans, fontSize: 16, color: '#E88A8A' },
  signOutRow: { marginTop: 24, borderBottomWidth: 0 },
  signOut: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '600', color: 'rgba(235, 228, 248, 0.75)' },
});
