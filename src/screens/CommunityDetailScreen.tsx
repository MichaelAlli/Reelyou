import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommunitiesScreenLayout } from '@/components/communities/CommunitiesScreenLayout';
import { CommunityIcon } from '@/components/communities/CommunityIcon';
import { GlowButton } from '@/components/GlowButton';
import { CommunitiesCopy } from '@/constants/communitiesCopy';
import { getCommunityById } from '@/constants/communitiesData';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';

interface CommunityDetailScreenProps {
  communityId?: string;
}

const ICON_COLORS = {
  briefcase: '#C4B5FD',
  leaf: '#F5E6B8',
  creative: '#7EECD8',
  community: '#D8C4FF',
  career: '#A5C4FF',
  wellness: '#86EFAC',
  leadership: '#FCD34D',
  travel: '#93C5FD',
} as const;

export function CommunityDetailScreen({ communityId }: CommunityDetailScreenProps) {
  const router = useRouter();
  const { isCommunityJoined, joinCommunity, leaveCommunity } = useOnboarding();
  const community = getCommunityById(communityId);
  const joined = community ? isCommunityJoined(community.id) : false;

  const styles = communityDetailStyles;

  if (!community) {
    return (
      <CommunitiesScreenLayout>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CommunitiesCopy.back}
          onPress={() => router.back()}
          style={styles.back}>
          <Text style={styles.backText}>{CommunitiesCopy.back}</Text>
        </Pressable>
        <Text style={styles.notFoundTitle}>{CommunitiesCopy.notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{CommunitiesCopy.notFoundBody}</Text>
      </CommunitiesScreenLayout>
    );
  }

  const iconColor = ICON_COLORS[community.icon];

  return (
    <CommunitiesScreenLayout>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={CommunitiesCopy.back}
        onPress={() => router.back()}
        style={styles.back}>
        <Text style={styles.backText}>{CommunitiesCopy.back}</Text>
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <CommunityIcon type={community.icon} color={iconColor} size={28} />
        </View>
        <Text style={styles.name}>{community.name}</Text>
        <Text style={styles.description}>{community.description}</Text>
      </View>

      <View style={styles.actions}>
        {joined ? (
          <>
            <Text style={styles.joinedNote}>{CommunitiesCopy.joinedNote}</Text>
            <GlowButton
              label={CommunitiesCopy.leaveCta}
              onPress={() => leaveCommunity(community.id)}
              variant="ghost"
            />
          </>
        ) : (
          <GlowButton
            label={CommunitiesCopy.joinCta}
            onPress={() => joinCommunity(community.id, community.name)}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{CommunitiesCopy.detailAboutTitle}</Text>
        <Text style={styles.sectionBody}>{community.about}</Text>
      </View>

      {community.moments.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{CommunitiesCopy.detailMomentsTitle}</Text>
          {community.moments.map((moment) => (
            <View key={moment} style={styles.moment}>
              <Text style={styles.momentText}>{moment}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </CommunitiesScreenLayout>
  );
}

const communityDetailStyles = StyleSheet.create({
  back: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: HomePalette.gold,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 28, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  name: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: HomePalette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  joinedNote: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: HomePalette.lavender,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: HomePalette.gold,
  },
  sectionBody: {
    fontFamily: Fonts.sans,
    fontSize: 14.5,
    lineHeight: 21,
    color: HomePalette.textSecondary,
  },
  moment: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HomePalette.cardEdge,
    backgroundColor: 'rgba(12, 10, 28, 0.45)',
    padding: Spacing.md,
  },
  momentText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: HomePalette.textPrimary,
  },
  notFoundTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    marginTop: Spacing.lg,
  },
  notFoundBody: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: HomePalette.textSecondary,
    marginTop: Spacing.sm,
  },
});
