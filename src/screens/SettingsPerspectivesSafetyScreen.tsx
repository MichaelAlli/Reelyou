import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkyInvitationSafetyCopy } from '@/constants/skyInvitationSafetyCopy';
import { Fonts, Spacing } from '@/constants/theme';

export function SettingsPerspectivesSafetyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{SkyInvitationSafetyCopy.aboutTitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.lead}>{SkyInvitationSafetyCopy.title}</Text>
        <Text style={styles.body}>{SkyInvitationSafetyCopy.body}</Text>
        <Text style={styles.body}>{SkyInvitationSafetyCopy.aboutBody}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  back: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: '#E8C872',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  lead: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
  },
});
