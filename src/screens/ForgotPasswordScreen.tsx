import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthPrimaryButton, AuthScreenScrollShell, AuthTextField } from '@/components/auth';
import { QaPreviewReadOnlyBanner } from '@/components/qa/QaPreviewReadOnlyBanner';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { authWebRootFillStyle } from '@/constants/authViewportLayout';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { requestPasswordReset, requestUsernameRecovery } from '@/auth/reellyouAuthApi';
import { Fonts } from '@/constants/theme';

const RESEND_COOLDOWN_MS = 90_000;

type SubmitOutcome =
  | { kind: 'idle' }
  | { kind: 'sent'; maskedEmail: string }
  | { kind: 'not_found' };

type RecoveryMode = 'password' | 'username';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const qaPreview = useQaPreviewMode();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<RecoveryMode>('password');
  const [outcome, setOutcome] = useState<SubmitOutcome>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSec(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSec(remaining);
      if (remaining <= 0) setCooldownUntil(null);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const validateEmail = useCallback((): string | null => {
    setError(null);
    setOutcome({ kind: 'idle' });
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter the email address on your account.');
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return null;
    }
    if (cooldownUntil != null && cooldownUntil > Date.now()) {
      setError(`Please wait ${cooldownSec}s before requesting another email.`);
      return null;
    }
    return trimmed;
  }, [cooldownSec, cooldownUntil, email]);

  const applyRecoveryResult = useCallback(
    (result: Awaited<ReturnType<typeof requestPasswordReset>>) => {
      if (!result.ok) {
        setError(mapAuthErrorToMessage(result.error));
        return;
      }
      if (!result.accountFound) {
        setOutcome({ kind: 'not_found' });
        return;
      }
      setOutcome({ kind: 'sent', maskedEmail: result.maskedEmail });
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
    },
    [],
  );

  /** Primary forgot-password action — always POST /v1/auth/password/forgot */
  const sendPasswordResetEmail = useCallback(async () => {
    if (qaPreview.readOnly) return;
    const trimmed = validateEmail();
    if (!trimmed) return;
    setLoading(true);
    const result = await requestPasswordReset(trimmed);
    setLoading(false);
    applyRecoveryResult(result);
  }, [applyRecoveryResult, qaPreview.readOnly, validateEmail]);

  /** "Forgot which email you used?" — POST /v1/auth/username/forgot */
  const sendUsernameReminder = useCallback(async () => {
    if (qaPreview.readOnly) return;
    const trimmed = validateEmail();
    if (!trimmed) return;
    setLoading(true);
    const result = await requestUsernameRecovery(trimmed);
    setLoading(false);
    applyRecoveryResult(result);
  }, [applyRecoveryResult, qaPreview.readOnly, validateEmail]);

  const switchMode = useCallback((next: RecoveryMode) => {
    setMode(next);
    setOutcome({ kind: 'idle' });
    setError(null);
  }, []);

  const sendDisabled =
    qaPreview.readOnly || loading || (cooldownUntil != null && cooldownUntil > Date.now());

  return (
    <View style={[styles.root, authWebRootFillStyle()]}>
      <AuthScreenScrollShell
        edges={['top', 'bottom']}
        scrollBottomPadding={24}
        contentContainerStyle={styles.scrollContent}>
      <View style={styles.panel}>
        <QaPreviewReadOnlyBanner />
        <Text style={styles.title}>{mode === 'password' ? 'Forgot password' : 'Forgot sign-in email'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'password'
            ? 'Enter your account email. We will send a secure reset link.'
            : 'Enter your account email. We will send your sign-in email address privately.'}
        </Text>
        <AuthTextField
          icon="person"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setOutcome({ kind: 'idle' });
            setError(null);
          }}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {outcome.kind === 'sent' ? (
          <Text style={styles.message}>
            {mode === 'password'
              ? `Password reset email sent to ${outcome.maskedEmail}. Check your inbox and spam folder.`
              : `Sign-in email reminder sent to ${outcome.maskedEmail}. Check your inbox and spam folder.`}
          </Text>
        ) : null}
        {outcome.kind === 'not_found' ? (
          <View style={styles.notFoundBlock}>
            <Text style={styles.notFound}>
              We couldn&apos;t find a Reelyou account with that email.
            </Text>
            <Pressable onPress={() => setOutcome({ kind: 'idle' })} accessibilityRole="button">
              <Text style={styles.link}>Try another email</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/signup' as never)} accessibilityRole="button">
              <Text style={styles.link}>Create account</Text>
            </Pressable>
          </View>
        ) : null}
        {mode === 'password' ? (
          <AuthPrimaryButton
            label={cooldownSec > 0 ? `Send again in ${cooldownSec}s` : 'Send reset email'}
            onPress={() => void sendPasswordResetEmail()}
            loading={loading}
            disabled={sendDisabled}
          />
        ) : (
          <AuthPrimaryButton
            label={cooldownSec > 0 ? `Send again in ${cooldownSec}s` : 'Send reminder'}
            onPress={() => void sendUsernameReminder()}
            loading={loading}
            disabled={sendDisabled}
          />
        )}
        <Pressable
          onPress={() => switchMode(mode === 'password' ? 'username' : 'password')}
          accessibilityRole="button">
          <Text style={styles.link}>
            {mode === 'password' ? 'Forgot which email you used?' : 'Need to reset your password instead?'}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/login' as never)}>
          <Text style={styles.back}>Back to sign in</Text>
        </Pressable>
      </View>
      </AuthScreenScrollShell>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8 },
  panel: { gap: 14 },
  title: { fontFamily: Fonts.serif, fontSize: 24, color: '#FFF8F0', textAlign: 'center' },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.75)',
    textAlign: 'center',
  },
  error: { fontFamily: Fonts.sans, fontSize: 13, color: '#ffb4b4' },
  message: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, color: '#E8C872' },
  notFoundBlock: { gap: 10, alignItems: 'center' },
  notFound: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: '#E8C872',
    textAlign: 'center',
  },
  link: { fontFamily: Fonts.sans, fontSize: 13, color: '#E8C872', textAlign: 'center', marginTop: 4 },
  back: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248,244,236,0.85)',
    textAlign: 'center',
    marginTop: 16,
  },
});
