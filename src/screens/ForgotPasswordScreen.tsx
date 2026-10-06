import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthPrimaryButton, AuthTextField } from '@/components/auth';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { requestPasswordReset, requestUsernameRecovery } from '@/auth/reellyouAuthApi';
import { Fonts } from '@/constants/theme';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'password' | 'username'>('password');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    setMessage(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter the email address on your account.');
      return;
    }
    setLoading(true);
    const result =
      mode === 'password'
        ? await requestPasswordReset(trimmed)
        : await requestUsernameRecovery(trimmed);
    setLoading(false);
    if (!result.ok) {
      setError(mapAuthErrorToMessage(result.error));
      return;
    }
    if (result.emailSent === false) {
      setMessage(
        'If an account exists for that email, we will send instructions when email delivery is configured on the server.',
      );
    } else {
      setMessage(
        'If an account exists for that email, we sent instructions. Check your inbox and spam folder.',
      );
    }
  }, [email, mode]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.panel}>
        <Text style={styles.title}>{mode === 'password' ? 'Forgot password' : 'Forgot sign-in email'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'password'
            ? 'Enter your account email. We will send a secure reset link.'
            : 'Enter your account email. We will send your sign-in email address privately.'}
        </Text>
        <AuthTextField
          icon="person"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <AuthPrimaryButton label="Send email" onPress={() => void submit()} loading={loading} disabled={loading} />
        <Pressable onPress={() => setMode(mode === 'password' ? 'username' : 'password')}>
          <Text style={styles.link}>
            {mode === 'password' ? 'Forgot which email you used?' : 'Need to reset your password instead?'}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back to sign in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050508', justifyContent: 'center', padding: 20 },
  panel: { gap: 14 },
  title: { fontFamily: Fonts.serif, fontSize: 24, color: '#FFF8F0', textAlign: 'center' },
  subtitle: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: 'rgba(248,244,236,0.75)', textAlign: 'center' },
  error: { fontFamily: Fonts.sans, fontSize: 13, color: '#ffb4b4' },
  message: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, color: '#E8C872' },
  link: { fontFamily: Fonts.sans, fontSize: 13, color: '#E8C872', textAlign: 'center', marginTop: 8 },
  back: { fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(248,244,236,0.85)', textAlign: 'center', marginTop: 16 },
});
