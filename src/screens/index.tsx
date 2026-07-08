import { ConstellationMap } from '@/components/ConstellationMap';
import { GlassCard } from '@/components/GlassCard';
import { GlowButton } from '@/components/GlowButton';
import { ImpactMomentCard } from '@/components/ImpactMomentCard';
import { LegacyCard } from '@/components/LegacyCard';
import { MetricPill } from '@/components/MetricPill';
import { OpportunityDoorCard } from '@/components/OpportunityDoorCard';
import { OrbitAvatar } from '@/components/OrbitAvatar';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ScreenLayout } from '@/components/ScreenLayout';
import { SectionHeader } from '@/components/SectionHeader';
import { SkyPreviewCard } from '@/components/SkyPreviewCard';
import { SkywriteComposer } from '@/components/SkywriteComposer';
import { TabPill } from '@/components/TabPill';
import { CosmicTheme, Fonts, Spacing } from '@/constants/theme';
import {
  currentUser,
  dailySignal,
  impactMetrics,
  impactMoments,
  legacyStories,
  mapFilters,
  onboardingSlides,
  opportunityDoors,
  orbitUsers,
  profileStats,
  starpathData,
  suggestedSkies,
} from '@/data/mockData';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function OnboardingScreen() {
  const router = useRouter();

  return (
    <ScreenLayout>
      <Text style={styles.screenTitle}>Welcome to REELYOU</Text>
      <Text style={styles.screenSubtitle}>A Human Potential Network</Text>
      {onboardingSlides.map((slide, i) => (
        <GlassCard key={slide.id} style={styles.slideCard} glow={i % 2 === 0 ? 'gold' : 'purple'}>
          <Text style={styles.slideNumber}>{i + 1}</Text>
          <Text style={styles.slideText}>{slide.title}</Text>
          <Text style={styles.slideSub}>{slide.subtitle}</Text>
        </GlassCard>
      ))}
      <GlowButton
        label="Start My Sky"
        onPress={() => router.replace('/(tabs)/home' as never)}
        style={styles.cta}
      />
    </ScreenLayout>
  );
}

export function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenLayout showTabBar>
      <Text style={styles.greeting}>Good Morning, Michael</Text>
      <Text style={styles.sectionLabel}>My Sky</Text>

      <GlassCard glow="purple">
        <Text style={styles.cardLabel}>Daily Signal</Text>
        <Text style={styles.signalText}>{dailySignal}</Text>
      </GlassCard>

      <Pressable onPress={() => router.push('/skywrite' as never)}>
        <GlassCard style={styles.promptCard}>
          <Text style={styles.promptLabel}>What&apos;s on your heart today?</Text>
          <Text style={styles.promptHint}>Tap to Skywrite →</Text>
        </GlassCard>
      </Pressable>

      <SectionHeader title="My Sky" />
      <SkyPreviewCard description="A living map of your growth, patterns, and the communities shaping your journey." />

      <SectionHeader title="Starpath" action="View" onAction={() => router.push('/starpath' as never)} />
      <Pressable onPress={() => router.push('/starpath' as never)}>
        <GlassCard>
          <Text style={styles.previewTitle}>{starpathData.currentPath}</Text>
          <Text style={styles.previewSub}>{starpathData.suggestedNextStep}</Text>
        </GlassCard>
      </Pressable>

      <SectionHeader title="Orbit" action="View all" onAction={() => router.push('/orbit' as never)} />
      <View style={styles.avatarRow}>
        {orbitUsers.slice(0, 4).map((user) => (
          <OrbitAvatar
            key={user.id}
            user={user}
            size="sm"
            onPress={() => router.push(`/public-sky?id=${user.id}` as never)}
          />
        ))}
      </View>

      <SectionHeader title="Legacy" action="Enter" onAction={() => router.push('/legacy' as never)} />
      <LegacyCard
        heroLine="The people whose lives became different because you existed."
        showButton={false}
      />
    </ScreenLayout>
  );
}

export function SkywriteScreen() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ScreenLayout scroll={false}>
        <View style={styles.success}>
          <Text style={styles.successStar}>✦</Text>
          <Text style={styles.successTitle}>Your reflection became a star in your sky.</Text>
          <GlowButton label="Return Home" onPress={() => router.back()} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.screenTitle}>Skywrite</Text>
      <Text style={styles.screenSubtitle}>Release what&apos;s on your heart into your sky.</Text>
      <SkywriteComposer onSubmit={() => setSubmitted(true)} />
    </ScreenLayout>
  );
}

export function StarpathScreen() {
  const router = useRouter();

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.screenTitle}>Starpath</Text>
      <Text style={styles.screenSubtitle}>Direction and opportunity on your journey.</Text>

      <SectionHeader title="Current Path" />
      <GlassCard glow="gold">
        <Text style={styles.pathText}>{starpathData.currentPath}</Text>
      </GlassCard>

      <SectionHeader title="Suggested Next Step" />
      <GlassCard>
        <Text style={styles.previewSub}>{starpathData.suggestedNextStep}</Text>
      </GlassCard>

      <SectionHeader title="Opportunity Doors" />
      {opportunityDoors.map((door) => (
        <OpportunityDoorCard key={door.id} door={door} />
      ))}

      <SectionHeader title="Companion Star" />
      <GlassCard glow="purple">
        <Text style={styles.insightText}>{starpathData.companionInsight}</Text>
      </GlassCard>
    </ScreenLayout>
  );
}

export function ImpactScreen() {
  return (
    <ScreenLayout showTabBar>
      <Text style={styles.screenTitle}>Impact</Text>
      <Text style={styles.screenSubtitle}>The meaning you create in the world.</Text>

      <View style={styles.metricsGrid}>
        <MetricPill label="Lives Encouraged" value={impactMetrics.livesEncouraged} />
        <MetricPill label="Contributions Made" value={impactMetrics.contributionsMade} accent="purple" />
        <MetricPill label="Reflections Resonated" value={impactMetrics.reflectionsResonated} />
        <MetricPill label="Doors Opened" value={impactMetrics.doorsOpened} accent="purple" />
      </View>

      <GlassCard style={styles.definitions}>
        <Text style={styles.defTitle}>What these mean</Text>
        <Text style={styles.defText}>
          Lives Encouraged — people who felt uplifted because of you.{'\n'}
          Contributions Made — actions that helped others.{'\n'}
          Reflections Resonated — Skywrites that helped someone feel seen.{'\n'}
          Doors Opened — opportunities you helped create for others.
        </Text>
      </GlassCard>

      <SectionHeader title="Recent Impact Moments" />
      {impactMoments.map((moment) => (
        <ImpactMomentCard key={moment.id} moment={moment} />
      ))}
    </ScreenLayout>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Lives Encouraged');

  return (
    <ScreenLayout showTabBar>
      <ProfileHeader user={currentUser} />
      <TabPill tabs={['Lives Encouraged', 'Orbit', 'Legacy']} activeTab={tab} onTabChange={setTab} />

      {tab === 'Lives Encouraged' && (
        <SkyPreviewCard description="Your sky — a constellation of growth and impact." stats={profileStats} />
      )}

      {tab === 'Orbit' && (
        <>
          <SectionHeader title="Followed Skies" action="View all" onAction={() => router.push('/orbit' as never)} />
          <View style={styles.avatarRowWrap}>
            {orbitUsers.map((user) => (
              <OrbitAvatar
                key={user.id}
                user={user}
                onPress={() => router.push(`/public-sky?id=${user.id}` as never)}
              />
            ))}
          </View>
        </>
      )}

      {tab === 'Legacy' && (
        <LegacyCard
          heroLine="The people whose lives became different because you existed."
          subtitle="Every star represents a life you've touched."
          onEnter={() => router.push('/legacy' as never)}
        />
      )}
    </ScreenLayout>
  );
}

export function LegacyScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Constellation');

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.screenTitle}>Legacy</Text>
      <Text style={styles.heroLine}>The people whose lives became different because you existed.</Text>
      <Text style={styles.screenSubtitle}>Every star represents a life you&apos;ve touched.</Text>

      <TabPill tabs={['Constellation', 'Stories', 'Ripple Effect', 'Timeline']} activeTab={tab} onTabChange={setTab} />

      {tab === 'Constellation' && <ConstellationMap />}

      {tab === 'Constellation' && (
        <>
          <SectionHeader title="Recent Legacy Stories" />
          {legacyStories.slice(0, 3).map((story) => (
            <GlassCard key={story.id} style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.storyName}>{story.name}</Text>
              <Text style={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</Text>
            </GlassCard>
          ))}
        </>
      )}

      {tab === 'Stories' &&
        legacyStories.map((story) => (
          <GlassCard key={story.id} style={{ marginBottom: Spacing.sm }}>
            <Text style={styles.storyName}>{story.name}</Text>
            <Text style={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</Text>
          </GlassCard>
        ))}

      {tab === 'Ripple Effect' && (
        <GlassCard glow="purple">
          <Text style={styles.previewSub}>
            Your presence has created ripples across 47 lives, 128 contributions, and 12 doors opened.
          </Text>
        </GlassCard>
      )}

      {tab === 'Timeline' && (
        legacyStories.map((story, i) => (
          <GlassCard key={story.id} style={{ marginBottom: Spacing.sm }}>
            <Text style={styles.timelineDate}>Chapter {i + 1}</Text>
            <Text style={styles.storyQuote}>{story.quote} — {story.name}</Text>
          </GlassCard>
        ))
      )}

      <GlassCard glow="gold" style={styles.movieCard}>
        <GlowButton label="Play My Legacy Movie" onPress={() => {}} variant="secondary" />
        <Text style={styles.movieSub}>Experience your story as a movie.</Text>
      </GlassCard>
    </ScreenLayout>
  );
}

export function OrbitScreen() {
  const router = useRouter();

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.screenTitle}>Orbit</Text>
      <Text style={styles.screenSubtitle}>People connected to your sky.</Text>

      {['My Orbit', 'Skies I Follow', 'Closest Connections', 'Suggested Paths Crossing'].map((section) => (
        <View key={section}>
          <SectionHeader title={section} />
          {orbitUsers.slice(0, 3).map((user) => (
            <GlassCard key={`${section}-${user.id}`} style={styles.orbitCard}>
              <View style={styles.orbitRow}>
                <OrbitAvatar user={user} size="md" showLabel={false} />
                <View style={styles.orbitInfo}>
                  <Text style={styles.previewTitle}>{user.name}</Text>
                  <Text style={styles.themes}>{user.themes.join(' • ')}</Text>
                  <GlowButton
                    label="View Sky"
                    variant="ghost"
                    onPress={() => router.push(`/public-sky?id=${user.id}` as never)}
                    style={styles.viewSkyBtn}
                  />
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      ))}
    </ScreenLayout>
  );
}

export function PublicSkyScreen({ userId }: { userId?: string }) {
  const router = useRouter();
  const user = orbitUsers.find((u) => u.id === userId) ?? orbitUsers[0];

  return (
    <ScreenLayout>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <ProfileHeader
        user={{
          id: user.id,
          name: user.name,
          subtitle: user.label,
          bio: `Walking a path of ${user.themes.join(' and ')}.`,
          location: 'Connected Sky',
          avatarInitials: user.avatarInitials,
          avatarColor: user.avatarColor,
          themes: user.themes,
        }}
      />
      <View style={styles.actionRow}>
        <GlowButton label="Follow Sky" onPress={() => {}} style={styles.actionBtn} />
        <GlowButton label="Encourage" onPress={() => {}} variant="secondary" style={styles.actionBtn} />
      </View>

      <View style={styles.metricsRow}>
        <MetricPill label="Lives Encouraged" value={23} />
        <MetricPill label="Contributions Made" value={56} accent="purple" />
      </View>

      <LegacyCard
        heroLine="The people whose lives became different because they existed."
        showButton={false}
      />

      <SectionHeader title="My Sky" />
      <SkyPreviewCard description="A living map of their growth and the communities shaping their journey." />
    </ScreenLayout>
  );
}

export function HumanPotentialMapScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Creativity');

  return (
    <ScreenLayout showTabBar>
      <Text style={styles.screenTitle}>Human Potential Map</Text>
      <Text style={styles.screenSubtitle}>Explore people and skies.</Text>

      <GlassCard>
        <Text style={styles.searchPlaceholder}>🔍  Search skies...</Text>
      </GlassCard>

      <TabPill tabs={mapFilters} activeTab={filter} onTabChange={setFilter} />

      <SectionHeader title="Skies I Follow" />
      <View style={styles.avatarRowWrap}>
        {orbitUsers.slice(0, 3).map((user) => (
          <OrbitAvatar
            key={user.id}
            user={user}
            onPress={() => router.push(`/public-sky?id=${user.id}` as never)}
          />
        ))}
      </View>

      <SectionHeader title="Suggested Skies" />
      {suggestedSkies.map((user) => (
        <Pressable key={user.id} onPress={() => router.push(`/public-sky?id=${user.id}` as never)}>
          <GlassCard style={{ marginBottom: Spacing.sm }}>
            <View style={styles.orbitRow}>
              <OrbitAvatar user={user} size="sm" showLabel={false} />
              <View style={styles.orbitInfo}>
                <Text style={styles.previewTitle}>{user.name}</Text>
                <Text style={styles.themes}>{user.themes.join(' • ')}</Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      ))}

      <SectionHeader title="Paths Crossing" />
      <GlassCard glow="purple">
        <Text style={styles.previewSub}>
          3 people in your orbit share themes of {filter} — explore their skies.
        </Text>
      </GlassCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    fontWeight: '800',
    color: CosmicTheme.textPrimary,
    marginTop: Spacing.sm,
  },
  screenSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: CosmicTheme.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  slideCard: {
    marginBottom: Spacing.sm,
  },
  slideNumber: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: CosmicTheme.gold,
    marginBottom: Spacing.xs,
  },
  slideText: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    color: CosmicTheme.textPrimary,
    lineHeight: 24,
  },
  slideSub: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  cta: {
    marginTop: Spacing.lg,
  },
  greeting: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: CosmicTheme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: CosmicTheme.purple,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  signalText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: CosmicTheme.textPrimary,
    lineHeight: 24,
  },
  promptCard: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  promptLabel: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    color: CosmicTheme.textPrimary,
  },
  promptHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.gold,
    marginTop: Spacing.xs,
  },
  previewTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
  },
  previewSub: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  avatarRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  back: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: CosmicTheme.gold,
    fontWeight: '600',
  },
  success: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  successStar: {
    fontSize: 64,
    color: CosmicTheme.gold,
  },
  successTitle: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  pathText: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    color: CosmicTheme.textPrimary,
    lineHeight: 24,
  },
  doorType: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: CosmicTheme.purple,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  insightText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: CosmicTheme.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  definitions: {
    marginBottom: Spacing.md,
  },
  defTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: CosmicTheme.gold,
    marginBottom: Spacing.sm,
  },
  defText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.textSecondary,
    lineHeight: 20,
  },
  momentMetric: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: CosmicTheme.purple,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  heroLine: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    lineHeight: 28,
    marginTop: Spacing.xs,
  },
  storyName: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: CosmicTheme.gold,
    marginBottom: Spacing.xs,
  },
  storyQuote: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: CosmicTheme.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  timelineDate: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: CosmicTheme.purple,
    marginBottom: Spacing.xs,
  },
  movieCard: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  movieSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.textMuted,
    marginTop: Spacing.sm,
  },
  orbitCard: {
    marginBottom: Spacing.sm,
  },
  orbitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  orbitInfo: {
    flex: 1,
  },
  themes: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.textMuted,
    marginTop: 2,
  },
  viewSkyBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchPlaceholder: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: CosmicTheme.textMuted,
  },
});
