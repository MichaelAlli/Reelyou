import type { SkywriteShowingUpId } from '@/constants/skywriteCopy';
import type { SkywriteIntentId, SkywriteRecord } from '@/skywrite/types';

export const SKYWRITE_INTENT_OPTIONS: readonly {
  id: SkywriteIntentId;
  label: string;
}[] = [
  { id: 'reflection', label: 'Reflection' },
  { id: 'question', label: 'Question' },
  { id: 'perspective', label: 'Looking for perspective' },
  { id: 'learned', label: 'Sharing something learned' },
] as const;

export function inferSkywriteIntentFromShowingUp(
  showingUp: SkywriteShowingUpId | null | undefined,
): SkywriteIntentId {
  if (showingUp === 'question') return 'question';
  if (showingUp === 'encouragement' || showingUp === 'breakthrough') return 'learned';
  return 'reflection';
}

export function resolveSkywriteIntent(record: Pick<SkywriteRecord, 'intent' | 'showingUp'>): SkywriteIntentId {
  if (record.intent) return record.intent;
  return inferSkywriteIntentFromShowingUp(record.showingUp);
}

/** Beta — only perspective-seeking public posts may beacon (keeps delivery calm). */
export function isBeaconIntentEligible(record: Pick<SkywriteRecord, 'intent' | 'showingUp'>): boolean {
  const intent = resolveSkywriteIntent(record);
  return intent === 'question' || intent === 'perspective';
}
