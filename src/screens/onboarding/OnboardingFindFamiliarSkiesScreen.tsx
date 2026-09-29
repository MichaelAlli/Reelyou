import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  OnboardingBackButton,
  OnboardingPrimaryButton,
  OnboardingScreenShell,
} from '@/components/onboarding';
import { FindFamiliarSkiesCopy } from '@/constants/findFamiliarSkiesCopy';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { shareOwnerProfile } from '@/profile/shareOwnerProfile';
import { currentUser } from '@/data/mockData';

export function OnboardingFindFamiliarSkiesScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSettings = from === 'settings';
  const { markStep } = useOnboarding();
  const [query, setQuery] = useState('');
  const [inviteAck, setInviteAck] = useState<string | null>(null);
  const [contactsNote, setContactsNote] = useState<string | null>(null);

  const contactsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  const finish = useCallback(
    (status: 'completed' | 'skipped') => {
      if (!fromSettings) {
        markStep('findFamiliarSkies', status);
      }
      if (fromSettings) {
        router.back();
        return;
      }
      router.replace('/process' as never);
    },
    [fromSettings, markStep, router],
  );

  const handleContacts = useCallback(() => {
    if (!contactsSupported) {
      setContactsNote(FindFamiliarSkiesCopy.contactsUnavailableWeb);
      return;
    }
    setContactsNote(FindFamiliarSkiesCopy.deniedHint);
  }, [contactsSupported]);

  const handleInvite = useCallback(async () => {
    const result = await shareOwnerProfile({
      displayName: currentUser.name,
      ownerId: currentUser.id,
    });
    if (result === 'copied') {
      setInviteAck(FindFamiliarSkiesCopy.inviteCopied);
      setTimeout(() => setInviteAck(null), 2400);
    }
  }, []);

  const searchHint = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return `Search for “${q}” is available after signup from My Sky search.`;
  }, [query]);

  return (
    <OnboardingScreenShell
      leadingAccessory={
        <OnboardingBackButton
          onPress={() => router.replace('/onboarding/where-you-live' as never)}
        />
      }>
      <View style={styles.block}>
        <Text style={styles.title}>{FindFamiliarSkiesCopy.title}</Text>
        <Text style={styles.subtitle}>{FindFamiliarSkiesCopy.subtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{FindFamiliarSkiesCopy.contactsTitle}</Text>
          <Text style={styles.cardBody}>{FindFamiliarSkiesCopy.contactsBody}</Text>
          {contactsNote ? <Text style={styles.note}>{contactsNote}</Text> : null}
          <Pressable style={styles.secondaryBtn} onPress={handleContacts}>
            <Text style={styles.secondaryBtnText}>{FindFamiliarSkiesCopy.contactsAction}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{FindFamiliarSkiesCopy.searchTitle}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={FindFamiliarSkiesCopy.searchPlaceholder}
            placeholderTextColor="rgba(235,228,248,0.45)"
            style={styles.input}
          />
          {searchHint ? <Text style={styles.note}>{searchHint}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{FindFamiliarSkiesCopy.inviteTitle}</Text>
          <Text style={styles.cardBody}>{FindFamiliarSkiesCopy.inviteBody}</Text>
          {inviteAck ? <Text style={styles.note}>{inviteAck}</Text> : null}
          <Pressable style={styles.secondaryBtn} onPress={() => void handleInvite()}>
            <Text style={styles.secondaryBtnText}>{FindFamiliarSkiesCopy.inviteAction}</Text>
          </Pressable>
        </View>

        <OnboardingPrimaryButton
          label={FindFamiliarSkiesCopy.continue}
          onPress={() => finish('completed')}
        />
        <Pressable onPress={() => finish('skipped')} style={styles.skip}>
          <Text style={styles.skipText}>{FindFamiliarSkiesCopy.skip}</Text>
        </Pressable>
      </View>
    </OnboardingScreenShell>
  );
}

const styles = StyleSheet.create({
  block: { gap: 14, paddingBottom: 24 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.78)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    backgroundColor: 'rgba(8, 10, 28, 0.45)',
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F0FF',
  },
  cardBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248,244,236,0.75)',
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#FFF8F0',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(232, 200, 114, 0.85)',
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
  },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.65)',
  },
});
