import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import type { AuthSocialProvider } from '@/constants/auth';
import { AuthSocialMarkUris } from '@/constants/authSocialMarks';
import { SignUpDayLayout } from '@/constants/signUpDayLayout';

interface AuthSocialMarkProps {
  provider: AuthSocialProvider;
  size?: number;
}

const MARK_SIZE: Record<AuthSocialProvider, number> = {
  google: SignUpDayLayout.socialMarkGoogle,
  apple: SignUpDayLayout.socialMarkApple,
  facebook: SignUpDayLayout.socialMarkFacebook,
};

/** Official brand marks for daytime Sign Up social buttons. */
export function AuthSocialMark({ provider, size }: AuthSocialMarkProps) {
  const markSize = size ?? MARK_SIZE[provider];

  return (
    <Image
      accessibilityElementsHidden
      importantForAccessibility="no"
      source={{ uri: AuthSocialMarkUris[provider] }}
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
