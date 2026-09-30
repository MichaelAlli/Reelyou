import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { FindFamiliarSkiesCopy as Copy } from '@/constants/findFamiliarSkiesCopy';
import { Fonts } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { useFriendDiscovery } from '@/friendDiscovery/FriendDiscoveryProvider';
import {
  FACEBOOK_DISCOVERY_BLOCKER,
  isFacebookFriendDiscoveryConfigured,
} from '@/friendDiscovery/facebookDiscoveryConfig';
import {
  GOOGLE_CONTACTS_BLOCKER,
  isGoogleContactsDiscoveryConfigured,
} from '@/friendDiscovery/googleContactsDiscovery';
import {
  copyInvitationLink,
  openEmailInvitationComposer,
  openSmsInvitationComposer,
  shareInvitationViaNativeSheet,
} from '@/friendDiscovery/invitationShare';
import { readPhoneContactsPermissionStatus } from '@/friendDiscovery/phoneContactsDiscovery';

interface FindYourPeoplePanelProps {
  showDiscoverability?: boolean;
  showDisconnect?: boolean;
  compact?: boolean;
}

export function FindYourPeoplePanel({
  showDiscoverability = true,
  showDisconnect = false,
  compact = false,
}: FindYourPeoplePanelProps) {
  const router = useRouter();
  const {
    state,
    setDiscoverableByPhone,
    setDiscoverableByEmail,
    syncPhoneContacts,
    clearImportedContactMatches,
    disconnectGoogleContacts,
    disconnectFacebook,
  } = useFriendDiscovery();

  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [loading, setLoading] = useState<'phone' | null>(null);
  const [query, setQuery] = useState('');

  const flash = useCallback((message: string, ms = 2800) => {
    setStatusNote(message);
    setTimeout(() => setStatusNote(null), ms);
  }, []);

  const handlePhone = useCallback(async () => {
    if (Platform.OS === 'web') {
      flash(Copy.contactsUnavailableWeb);
      return;
    }
    setLoading('phone');
    try {
      const perm = await readPhoneContactsPermissionStatus();
      if (perm === 'denied') {
        flash(Copy.deniedHint);
        return;
      }
      if (perm === 'limited') {
        flash(Copy.limitedHint);
      }
      const result = await syncPhoneContacts();
      if (result.status === 'empty') flash(Copy.noMatches);
      else if (result.status === 'ok') flash('Matches found — see People you may know in Explore.');
      else if (result.message) flash(result.message);
    } finally {
      setLoading(null);
    }
  }, [flash, syncPhoneContacts]);

  const handleGoogle = useCallback(() => {
    if (!isGoogleContactsDiscoveryConfigured()) {
      flash(Copy.googleUnavailable);
      return;
    }
    flash(GOOGLE_CONTACTS_BLOCKER, 5000);
  }, [flash]);

  const handleFacebook = useCallback(() => {
    if (!isFacebookFriendDiscoveryConfigured()) {
      flash(Copy.facebookUnavailable);
      return;
    }
    flash(FACEBOOK_DISCOVERY_BLOCKER, 5000);
  }, [flash]);

  const handleInviteShare = useCallback(async () => {
    const result = await shareInvitationViaNativeSheet({
      ownerId: currentUser.id,
      displayName: currentUser.name,
    });
    if (result === 'copied') flash(Copy.inviteCopied);
    else if (result === 'opened_composer' || result === 'shared') flash(Copy.inviteOpened);
    else if (result === 'cancelled') flash(Copy.cancelNote);
    else if (result === 'blocked') flash('Set EXPO_PUBLIC_APP_ORIGIN to your HTTPS domain to share invites in production.');
  }, [flash]);

  const handleCopy = useCallback(async () => {
    const ok = await copyInvitationLink(currentUser.id);
    if (ok) flash(Copy.inviteCopied);
  }, [flash]);

  const handleSms = useCallback(async () => {
    const result = await openSmsInvitationComposer({
      ownerId: currentUser.id,
      displayName: currentUser.name,
    });
    if (result === 'opened_composer') flash(Copy.inviteOpened);
    else if (result === 'cancelled') flash(Copy.cancelNote);
    else if (result === 'copied') flash(Copy.inviteCopied);
  }, [flash]);

  const handleEmail = useCallback(async () => {
    const result = await openEmailInvitationComposer({
      ownerId: currentUser.id,
      displayName: currentUser.name,
    });
    if (result === 'opened_composer') flash(Copy.inviteOpened);
    else if (result === 'cancelled') flash(Copy.cancelNote);
    else if (result === 'copied') flash(Copy.inviteCopied);
  }, [flash]);

  const searchHint =
    query.trim().length > 0 ? Copy.searchHintWeb.replace('username', `“${query.trim()}”`) : null;

  return (
    <View style={[styles.block, compact ? styles.blockCompact : null]}>
      {statusNote ? <Text style={styles.note}>{statusNote}</Text> : null}

      <OptionCard
        title={Copy.phoneTitle}
        body={Copy.phoneBody}
        actionLabel={Copy.phoneAction}
        onPress={() => void handlePhone()}
        trailing={loading === 'phone' ? <ActivityIndicator color="#E8C872" /> : null}
      />

      <OptionCard title={Copy.googleTitle} body={Copy.googleBody} actionLabel={Copy.googleAction} onPress={handleGoogle} />

      {isFacebookFriendDiscoveryConfigured() ? (
        <OptionCard
          title={Copy.facebookTitle}
          body={Copy.facebookBody}
          actionLabel={Copy.facebookAction}
          onPress={handleFacebook}
        />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{Copy.inviteTitle}</Text>
        <Text style={styles.cardBody}>{Copy.inviteBody}</Text>
        <View style={styles.rowActions}>
          <TextAction label={Copy.inviteAction} onPress={() => void handleInviteShare()} />
          <TextAction label={Copy.copyLinkAction} onPress={() => void handleCopy()} />
          <TextAction label={Copy.smsAction} onPress={() => void handleSms()} />
          <TextAction label={Copy.emailAction} onPress={() => void handleEmail()} />
        </View>
        <Text style={styles.cardHint}>{Copy.instagramBody}</Text>
        <TextAction label={Copy.instagramAction} onPress={() => void handleInviteShare()} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{Copy.searchTitle}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={Copy.searchPlaceholder}
          placeholderTextColor="rgba(235,228,248,0.45)"
          style={styles.input}
        />
        {searchHint ? <Text style={styles.note}>{searchHint}</Text> : null}
        {query.trim().length > 1 ? (
          <TextAction
            label="Open My Sky search"
            onPress={() => router.push('/(post-welcome)/(tabs)/sky' as never)}
          />
        ) : null}
      </View>

      {showDiscoverability ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Copy.discoverabilityTitle}</Text>
          <ToggleRow
            label={Copy.discoverabilityPhone}
            hint={Copy.discoverabilityPhoneHint}
            value={state.discoverableByVerifiedPhone}
            onValueChange={setDiscoverableByPhone}
          />
          <ToggleRow
            label={Copy.discoverabilityEmail}
            hint={Copy.discoverabilityEmailHint}
            value={state.discoverableByVerifiedEmail}
            onValueChange={setDiscoverableByEmail}
          />
        </View>
      ) : null}

      {showDisconnect ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Copy.disconnectTitle}</Text>
          <Text style={styles.cardBody}>{Copy.disconnectBody}</Text>
          <TextAction label={Copy.disconnectAction} onPress={clearImportedContactMatches} />
          {state.googleContactsConnected ? (
            <TextAction label={Copy.disconnectGoogle} onPress={disconnectGoogleContacts} />
          ) : null}
          {state.facebookConnected ? (
            <TextAction label="Disconnect Facebook" onPress={disconnectFacebook} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function OptionCard({
  title,
  body,
  actionLabel,
  onPress,
  trailing,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
      <Pressable style={styles.secondaryBtn} onPress={onPress}>
        <Text style={styles.secondaryBtnText}>{actionLabel}</Text>
        {trailing}
      </Pressable>
    </View>
  );
}

function TextAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryBtn} onPress={onPress} accessibilityRole="button">
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: 'rgba(80,70,110,0.6)', true: 'rgba(232, 200, 114, 0.45)' }}
        thumbColor={value ? '#E8C872' : '#C4B5D8'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 14 },
  blockCompact: { gap: 10 },
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
  cardHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248,244,236,0.55)',
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
    textAlign: 'center',
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
  },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  toggleCopy: { flex: 1, gap: 4 },
  toggleLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  toggleHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(248,244,236,0.55)',
  },
});
