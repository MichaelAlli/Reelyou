import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FindFamiliarSkiesCopy as Copy } from '@/constants/findFamiliarSkiesCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { PeopleYouMayKnowRow } from '@/friendDiscovery/components/PeopleYouMayKnowRow';
import { useFriendDiscovery } from '@/friendDiscovery/FriendDiscoveryProvider';

export function PeopleYouMayKnowSection() {
  const router = useRouter();
  const { peopleYouMayKnow, dismissSuggestion } = useFriendDiscovery();

  if (peopleYouMayKnow.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.sectionTitle}>People you may know</Text>
        <Text style={styles.emptyBody}>{Copy.noMatches}</Text>
        <Pressable
          onPress={() => router.push('/onboarding/find-familiar-skies?from=settings' as never)}>
          <Text style={styles.link}>{Copy.exploreEntry}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>People you may know</Text>
      <Text style={styles.sectionHint}>Separate from interest-based Suggested Skies.</Text>
      {peopleYouMayKnow.map((suggestion) => (
        <PeopleYouMayKnowRow
          key={suggestion.userId}
          suggestion={suggestion}
          onDismiss={dismissSuggestion}
        />
      ))}
      <Pressable
        style={styles.footerLink}
        onPress={() => router.push('/onboarding/find-familiar-skies?from=settings' as never)}>
        <Text style={styles.link}>{Copy.exploreEntry}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    backgroundColor: 'rgba(8, 10, 28, 0.45)',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.15)',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248,244,236,0.45)',
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248,244,236,0.72)',
  },
  link: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
  },
  footerLink: { marginTop: 8, alignItems: 'flex-start' },
});
