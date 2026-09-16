import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommunityCard } from '@/components/communities/CommunityCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { CommunitiesCopy } from '@/constants/communitiesCopy';
import { getExploreCommunities, getGrowingInCommunities } from '@/constants/communitiesData';
import { Fonts, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

export function CommunitiesListScreen() {
  const router = useRouter();
  const { isCommunityJoined } = useOnboarding();
  const growingIn = getGrowingInCommunities();
  const explore = getExploreCommunities();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      back: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
        minHeight: 44,
        justifyContent: 'center',
      },
      backText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        color: tokens.gold,
        fontWeight: '600',
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 28,
        fontWeight: '600',
        color: tokens.primaryText,
        marginTop: Spacing.sm,
        letterSpacing: -0.3,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 22,
        color: tokens.secondaryText,
        marginBottom: Spacing.lg,
      },
      section: {
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
      },
      sectionTitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: tokens.gold,
        marginBottom: Spacing.xs,
      },
      endNote: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 17,
        color: tokens.mutedText,
        textAlign: 'center',
        paddingBottom: Spacing.xl,
      },
    }),
  );

  const openCommunity = (id: string) => {
    router.push(`/community?id=${id}` as never);
  };

  return (
    <ScreenLayout>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={CommunitiesCopy.back}
        onPress={() => router.back()}
        style={styles.back}>
        <Text style={styles.backText}>{CommunitiesCopy.back}</Text>
      </Pressable>

      <Text style={styles.title}>{CommunitiesCopy.listTitle}</Text>
      <Text style={styles.subtitle}>{CommunitiesCopy.listSubtitle}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{CommunitiesCopy.growingInSection}</Text>
        {growingIn.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            joined={isCommunityJoined(community.id)}
            onPress={() => openCommunity(community.id)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{CommunitiesCopy.exploreSection}</Text>
        {explore.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            joined={isCommunityJoined(community.id)}
            onPress={() => openCommunity(community.id)}
          />
        ))}
      </View>

      <Text style={styles.endNote}>More communities may appear as REELYOU grows.</Text>
    </ScreenLayout>
  );
}
