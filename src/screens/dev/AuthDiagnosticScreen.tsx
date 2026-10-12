import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { currentUser } from '@/data/mockData';
import { useOnboarding } from '@/onboarding';
import { Fonts } from '@/constants/theme';

/** DEV-only — confirms whether the active session is real server auth or mock fallback. */
export function AuthDiagnosticScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const { state: onboardingState, userSessionHydrated } = useOnboarding();
  const activeUserId = resolveActiveUserId(auth.user);
  const mockFallbackActive =
    isReelyouAuthConfigured() && !auth.isAuthenticated && activeUserId == null;
  const demoIdentityLeak =
    isReelyouAuthConfigured() &&
    auth.isAuthenticated &&
    activeUserId != null &&
    activeUserId === currentUser.id;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Auth diagnostic (dev)</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Row label="Server auth enabled" value={String(isReelyouAuthConfigured())} />
        <Row label="Auth provider" value="Reelyou custom backend (JWT)" />
        <Row label="Authenticated" value={String(auth.isAuthenticated)} />
        <Row label="Auth user ID" value={auth.user?.id ?? '—'} />
        <Row label="Auth email" value={auth.user?.email ?? '—'} />
        <Row label="Active storage user ID" value={activeUserId ?? '—'} />
        <Row label="Mock Michael ID (demo)" value={currentUser.id} />
        <Row label="Demo bypass active" value={String(!isReelyouAuthConfigured())} />
        <Row label="Mock fallback while signed out" value={String(mockFallbackActive)} />
        <Row label="Session uses demo Michael ID" value={String(demoIdentityLeak)} />
        <Row label="Onboarding complete" value={String(onboardingState.isOnboardingComplete)} />
        <Row label="User session hydrated" value={String(userSessionHydrated)} />
        <Text style={styles.hint}>
          Beta path: when server auth is enabled, you should see Authenticated true, a non-demo auth
          user ID, and Demo bypass active false.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#C9B896', fontSize: 14 },
  title: { fontFamily: Fonts.sans, color: '#F8F4EC', fontSize: 16, fontWeight: '600' },
  content: { padding: 16, gap: 10 },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    gap: 4,
  },
  label: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(248,244,236,0.55)' },
  value: { fontFamily: Fonts.sans, fontSize: 14, color: '#F8F4EC' },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248,244,236,0.65)',
    marginTop: 16,
  },
});
