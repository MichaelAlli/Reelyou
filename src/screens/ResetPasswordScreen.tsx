import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthPrimaryButton, AuthTextField } from '@/components/auth';
import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { resetPasswordWithToken } from '@/auth/reellyouAuthApi';
import { Fonts } from '@/constants/theme';

export function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    if (password.length < 8) {
      setError('Choose a password at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const resetToken = typeof token === 'string' ? token : '';
    if (!resetToken) {
      setError('This reset link is invalid. Request a new one from sign in.');
      return;
    }
    setLoading(true);
    const result = await resetPasswordWithToken({ token: resetToken, password });
    setLoading(false);
    if (!result.ok) {
      setError(
        result.error === 'invalid_or_expired_token'
          ? 'This reset link expired or was already used. Request a new one.'
          : mapAuthErrorToMessage(result.error),
      );
      return;
    }
    setDone(true);
  }, [confirm, password, token]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.panel}>
        <Text style={styles.title}>Choose a new password</Text>
        {done ? (
          <>
            <Text style={styles.message}>Your password was updated. Sign in with your new password.</Text>
            <AuthPrimaryButton label="Go to sign in" onPress={() => router.replace('/login' as never)} />
          </>
        ) : (
          <>
            <AuthTextField
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              secureVisible={passwordVisible}
              onToggleSecure={() => setPasswordVisible((visible) => !visible)}
              showSecureToggle
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <AuthTextField
              icon="lock"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm password"
              secureVisible={confirmVisible}
              onToggleSecure={() => setConfirmVisible((visible) => !visible)}
              showSecureToggle
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AuthPrimaryButton label="Update password" onPress={() => void submit()} loading={loading} disabled={loading} />
          </>
        )}
        <Pressable onPress={() => router.replace('/login' as never)}>
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
  error: { fontFamily: Fonts.sans, fontSize: 13, color: '#ffb4b4' },
  message: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: '#E8C872', textAlign: 'center' },
  back: { fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(248,244,236,0.85)', textAlign: 'center', marginTop: 16 },
});
