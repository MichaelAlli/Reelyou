import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cancelAccountDeletion,
  fetchAccountDeletionStatus,
  requestAccountDeletion,
  type AccountDeletionStatus,
} from '@/auth/accountDeletionApi';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isReellyouBackendConfigured } from '@/backend/reellyouApiConfig';
import { Fonts, Spacing } from '@/constants/theme';

export function AccountDeletionScreen() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const [status, setStatus] = useState<AccountDeletionStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const backend = isReellyouBackendConfigured() && auth.configured;

  const refresh = useCallback(async () => {
    if (!backend || !auth.isAuthenticated) return;
    const next = await fetchAccountDeletionStatus();
    setStatus(next);
  }, [auth.isAuthenticated, backend]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onRequestDeletion = useCallback(() => {
    Alert.alert(
      'Delete account?',
      'Your account will be hidden from others immediately. You can cancel within 30 days. Active systems aim to purge within 90 days. Email reelyou.support@gmail.com if you need help.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              const result = await requestAccountDeletion();
              setBusy(false);
              if (!result.ok) {
                Alert.alert('Could not start deletion', result.error);
                return;
              }
              setStatus(result.status);
              await auth.logout();
              router.replace('/login' as never);
            })();
          },
        },
      ],
    );
  }, [auth, router]);

  const onCancelDeletion = useCallback(() => {
    void (async () => {
      setBusy(true);
      const result = await cancelAccountDeletion();
      setBusy(false);
      if (!result.ok) {
        Alert.alert('Could not cancel', result.error);
        return;
      }
      setStatus(result.status);
      Alert.alert('Deletion cancelled', 'Your account is no longer scheduled for deletion.');
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Delete account</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.body}>
          Private beta: account deletion hides you from others right away. You may cancel within 30
          days while signed in. Purge from active Reelyou systems is scheduled by 90 days. Backups
          and provider logs may retain data longer (see Privacy Policy draft).
        </Text>
        {!backend ? (
          <Text style={styles.body}>
            Server account deletion requires the Reelyou backend. Email reelyou.support@gmail.com
            to request deletion.
          </Text>
        ) : null}
        {status?.deletionPending ? (
          <View style={styles.box}>
            <Text style={styles.lead}>Deletion scheduled</Text>
            <Text style={styles.body}>
              Cancel by:{' '}
              {status.cancelUntil ? new Date(status.cancelUntil).toLocaleString() : '—'}
            </Text>
            <Text style={styles.body}>
              Target purge:{' '}
              {status.purgeAfter ? new Date(status.purgeAfter).toLocaleString() : '—'}
            </Text>
            {!status.lockedOut ? (
              <Pressable
                style={styles.buttonSecondary}
                disabled={busy}
                onPress={onCancelDeletion}>
                <Text style={styles.buttonSecondaryText}>Cancel deletion</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <Pressable
            style={styles.buttonDanger}
            disabled={busy || !backend || !auth.isAuthenticated}
            onPress={onRequestDeletion}>
            <Text style={styles.buttonDangerText}>Request account deletion</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#05070A' },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: { fontFamily: Fonts.sans, fontSize: 20, fontWeight: '700', color: '#FFF8F0' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  lead: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', color: '#FFF8F0' },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
  },
  box: { gap: Spacing.sm, padding: Spacing.md, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  buttonDanger: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#8B2E2E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  buttonDangerText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#FFF8F0' },
  buttonSecondary: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8C872',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  buttonSecondaryText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#E8C872' },
});
