import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatarCircularImage } from '@/components/identity/UserAvatarCircularImage';
import { RippleHeaderLogo } from '@/components/legacy/ripple/RippleHeaderLogo';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { currentUser } from '@/data/mockData';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { Fonts } from '@/constants/theme';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

/** Inner photo diameter — outer touch target stays ripple chrome (40×40). */
const IMPACT_HEADER_AVATAR_PX = 36;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'You';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function ImpactTopHeader() {
  const router = useRouter();
  const qaPreview = useQaPreviewMode();
  const { user: authUser } = useReelyouAuth();
  const { profilePhotoDisplayUri, profilePhotoRevision } = useUserAvatar();

  const displayName = authUser?.fullName?.trim() || currentUser.name;
  const initials = initialsFromName(displayName);
  const fallbackColor = currentUser.avatarColor;

  const openProfile = () => {
    const href = qaPreview.active
      ? withQaPreviewHref('/profile')
      : ('/(tabs)/profile' as const);
    router.push(href as never);
  };

  const avatarFallback = (
    <View style={[styles.initialsWrap, { backgroundColor: fallbackColor }]}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );

  return (
    <View style={styles.row}>
      <View style={styles.sideSpacer} accessibilityElementsHidden importantForAccessibility="no" />
      <View style={styles.logoSlot}>
        <RippleHeaderLogo />
      </View>
      <View style={styles.right}>
        <Pressable
          style={rippleGlass.chromeButton}
          accessibilityRole="button"
          accessibilityLabel="Open my profile"
          onPress={openProfile}
          hitSlop={4}>
          <View style={styles.avatarCenter}>
            {profilePhotoDisplayUri ? (
              <UserAvatarCircularImage
                uri={profilePhotoDisplayUri}
                size={IMPACT_HEADER_AVATAR_PX}
                recyclingKey={profilePhotoRevision}
                accessibilityLabel="Your profile picture"
                style={styles.avatarImage}
                fallback={avatarFallback}
              />
            ) : (
              avatarFallback
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginBottom: 4,
  },
  sideSpacer: {
    width: 40,
    height: 40,
  },
  logoSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  avatarCenter: {
    width: IMPACT_HEADER_AVATAR_PX,
    height: IMPACT_HEADER_AVATAR_PX,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: IMPACT_HEADER_AVATAR_PX / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    borderWidth: 0,
  },
  initialsWrap: {
    width: IMPACT_HEADER_AVATAR_PX,
    height: IMPACT_HEADER_AVATAR_PX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FCFBF8',
  },
});
