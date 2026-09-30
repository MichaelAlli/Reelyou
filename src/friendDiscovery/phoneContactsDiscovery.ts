import { Platform } from 'react-native';

import { postMatchContactIdentifiers } from '@/friendDiscovery/friendDiscoveryApiClient';
import type { ContactMatchResult } from '@/friendDiscovery/friendDiscoveryTypes';
import {
  extractEmailsFromContactFields,
  extractPhonesFromContactFields,
} from '@/friendDiscovery/normalizeContactIdentifiers';

export type PhoneContactsPermissionStatus =
  | 'unsupported_web'
  | 'denied'
  | 'limited'
  | 'granted'
  | 'undetermined';

export async function readPhoneContactsPermissionStatus(): Promise<PhoneContactsPermissionStatus> {
  if (Platform.OS === 'web') return 'unsupported_web';
  try {
    const Contacts = await import('expo-contacts');
    const perm = await Contacts.getPermissionsAsync();
    if (perm.status === Contacts.PermissionStatus.GRANTED) {
      return perm.accessPrivileges === 'limited' ? 'limited' : 'granted';
    }
    if (perm.status === Contacts.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  } catch {
    return 'denied';
  }
}

export async function requestPhoneContactsPermission(): Promise<PhoneContactsPermissionStatus> {
  if (Platform.OS === 'web') return 'unsupported_web';
  try {
    const Contacts = await import('expo-contacts');
    const perm = await Contacts.requestPermissionsAsync();
    if (perm.status === Contacts.PermissionStatus.GRANTED) {
      return perm.accessPrivileges === 'limited' ? 'limited' : 'granted';
    }
    return 'denied';
  } catch {
    return 'denied';
  }
}

/** Reads permitted device contacts and matches identifiers — address book is not persisted locally. */
export async function matchFromDeviceContacts(input: {
  viewerUserId: string;
  defaultCountryCallingCode?: string;
}): Promise<ContactMatchResult & { permission: PhoneContactsPermissionStatus }> {
  const permission = await readPhoneContactsPermissionStatus();
  if (permission === 'unsupported_web') {
    return {
      permission,
      status: 'error',
      matches: [],
      message: 'Use username search or invite friends from this browser.',
    };
  }
  if (permission === 'denied' || permission === 'undetermined') {
    return {
      permission,
      status: 'error',
      matches: [],
      message: 'Contacts access is off. You can enable it in system settings anytime.',
    };
  }

  try {
    const Contacts = await import('expo-contacts');
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    const phones: string[] = [];
    const emails: string[] = [];
    for (const contact of data) {
      phones.push(
        ...extractPhonesFromContactFields(
          contact.phoneNumbers,
          input.defaultCountryCallingCode ?? '1',
        ),
      );
      emails.push(...extractEmailsFromContactFields(contact.emails));
    }

    const result = await postMatchContactIdentifiers({
      viewerUserId: input.viewerUserId,
      phones,
      emails,
      source: 'phone_contacts',
    });
    return { ...result, permission };
  } catch {
    return {
      permission,
      status: 'error',
      matches: [],
      message: 'Could not read contacts on this device.',
    };
  }
}
