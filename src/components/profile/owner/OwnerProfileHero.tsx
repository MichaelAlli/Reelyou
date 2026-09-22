import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import type { OwnerProfileIdentity } from '@/profile/ownerProfileTypes';

interface OwnerProfileHeroProps {
  identity: OwnerProfileIdentity;
}

function OwnerProfileHeroComponent({ identity }: OwnerProfileHeroProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarGlow} />
        <View style={styles.avatarRing}>
          {identity.avatarUri ? (
            <Image source={{ uri: identity.avatarUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: identity.avatarColor }]}>
              <Text style={styles.avatarInitials}>{identity.avatarInitials}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.identityCard}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {identity.name}
          </Text>
          <Text style={styles.sparkles}>✦✦</Text>
        </View>
        <Text style={styles.roleLine} numberOfLines={2}>
          {identity.roleLine}
        </Text>
        <Text style={styles.bio} numberOfLines={4}>
          {identity.bio}
        </Text>
      </View>
    </View>
  );
}

export const OwnerProfileHero = memo(OwnerProfileHeroComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 0,
    marginBottom: 0,
  },
  avatarWrap: {
    width: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 148, 56, 0.28)',
    shadowColor: '#FF9F3A',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 3.5,
    borderColor: '#F5A623',
    overflow: 'hidden',
    shadowColor: '#E8872E',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    fontWeight: '700',
    color: '#05070A',
  },
  identityCard: {
    flex: 1,
    minHeight: 148,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 29,
    color: '#FFF8F0',
  },
  sparkles: {
    fontSize: 11,
    color: '#E8C872',
  },
  roleLine: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.82)',
  },
  bio: {
    marginTop: 7,
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    color: 'rgba(248, 244, 236, 0.88)',
  },
});
