import AsyncStorage from '@react-native-async-storage/async-storage';

export const SKY_INVITATION_SAFETY_VERSION = 1;

const STORAGE_KEY = '@reellyou/sky-invitation-safety-ack-v1';

export interface SkyInvitationSafetyAcknowledgement {
  userId: string;
  acknowledgedAt: string;
  version: number;
}

interface AckStore {
  byUserId: Record<string, SkyInvitationSafetyAcknowledgement>;
}

function parseStore(raw: string | null): AckStore {
  if (!raw) return { byUserId: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<AckStore>;
    if (!parsed.byUserId || typeof parsed.byUserId !== 'object') return { byUserId: {} };
    return { byUserId: parsed.byUserId as Record<string, SkyInvitationSafetyAcknowledgement> };
  } catch {
    return { byUserId: {} };
  }
}

export async function loadSkyInvitationSafetyAck(
  userId: string,
): Promise<SkyInvitationSafetyAcknowledgement | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const store = parseStore(raw);
  const entry = store.byUserId[userId];
  if (!entry || entry.version !== SKY_INVITATION_SAFETY_VERSION) return null;
  return entry;
}

export async function needsSkyInvitationSafetyAck(userId: string): Promise<boolean> {
  const entry = await loadSkyInvitationSafetyAck(userId);
  return entry == null;
}

export async function persistSkyInvitationSafetyAck(userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const store = parseStore(raw);
  const next: SkyInvitationSafetyAcknowledgement = {
    userId,
    acknowledgedAt: new Date().toISOString(),
    version: SKY_INVITATION_SAFETY_VERSION,
  };
  store.byUserId[userId] = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
