import AsyncStorage from '@react-native-async-storage/async-storage';

import { LEGAL_DOCUMENT_VERSION } from '@/constants/legalDocuments';

const KEY = '@reellyou/legal-consent-v1';

export interface StoredLegalConsent {
  version: string;
  privacyVersion: string;
  acceptedAt: number;
  termsAccepted: boolean;
}

export async function recordLegalConsent(
  termsAccepted: boolean,
  version: string = LEGAL_DOCUMENT_VERSION,
): Promise<void> {
  const record: StoredLegalConsent = {
    version,
    privacyVersion: version,
    acceptedAt: Date.now(),
    termsAccepted,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(record));
}

export async function readLegalConsent(): Promise<StoredLegalConsent | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLegalConsent;
  } catch {
    return null;
  }
}
