import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import type { AuthSocialProvider } from '@/constants/auth';
import { AuthSocialMarkUris, AuthSocialMarkUrisDark } from '@/constants/authSocialMarks';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';
import { SignUpNightLayout } from '@/constants/signUpNightLayout';
import { useAuthAppearance } from '@/hooks/use-auth-appearance';

interface AuthSocialMarkProps {
  provider: AuthSocialProvider;
  size?: number;
}

const MARK_SIZE: Record<AuthSocialProvider, number> = {
  google: SignUpDayLayout.socialMarkGoogle,
  apple: SignUpDayLayout.socialMarkApple,
  facebook: SignUpDayLayout.socialMarkFacebook,
};

const MARK_SIZE_NIGHT: Record<AuthSocialProvider, number> = {
  google: SignUpNightLayout.socialMarkGoogle,
  apple: SignUpNightLayout.socialMarkApple,
  facebook: SignUpNightLayout.socialMarkFacebook,
};

/** Official brand marks for daytime Sign Up social buttons. */
export function AuthSocialMark({ provider, size }: AuthSocialMarkProps) {
  const isLight = useAuthAppearance();
  const markSize = size ?? (isLight ? MARK_SIZE[provider] : MARK_SIZE_NIGHT[provider]);
  const uris = isLight ? AuthSocialMarkUris : AuthSocialMarkUrisDark;

  return (
    <Image
      accessibilityElementsHidden
      importantForAccessibility="no"
      source={{ uri: uris[provider] }}
      contentFit="contain"
      allowDownscaling={false}
      cachePolicy="memory-disk"
      transition={0}
      style={[styles.mark, { width: markSize, height: markSize }]}
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: 'transparent',
  },
});
