import type { SavedThreadRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import type { GrowthMicroChoice, GrowthMomentKind } from '@/skywrite/savedThreads/savedThreadTypes';

export const REVISIT_GRACE_MS = 10 * 60 * 1000;

/** Avoid prompting in the first minutes / first visit — invite on return. */
export function shouldOfferGrowthMicroPrompt(saved: SavedThreadRecord, now: number): boolean {
  const visits = saved.visitCount ?? 0;
  if (visits < 2 && now - saved.savedAt < REVISIT_GRACE_MS) {
    return false;
  }
  if (visits >= 2) return true;
  return now - saved.savedAt >= 86_400_000;
}

export function bodyForMicroChoice(choice: GrowthMicroChoice): string {
  switch (choice) {
    case 'yes':
      return 'This stayed with me.';
    case 'a_little':
      return 'A little of this stayed with me.';
    case 'not_really':
      return 'Not much stayed with me — and that’s okay.';
    case 'skip':
    default:
      return '';
  }
}

export function momentKindForPrompt(promptId: GrowthPromptId): GrowthMomentKind {
  switch (promptId) {
    case 'stayed':
      return 'stayed_with_me';
    case 'used':
      return 'used_this';
    case 'perspective':
      return 'see_differently';
    case 'less_alone':
      return 'less_alone';
    case 'hope':
      return 'hope';
    default:
      return 'perspective';
  }
}

export type GrowthPromptId = 'stayed' | 'used' | 'perspective' | 'less_alone' | 'hope';

export function promptCopy(promptId: GrowthPromptId): string {
  switch (promptId) {
    case 'stayed':
      return 'Did anything from this stay with you?';
    case 'used':
      return 'Did you use any of this?';
    case 'perspective':
      return 'Do you see this differently now?';
    case 'less_alone':
      return 'Did this remind you that you weren’t alone?';
    case 'hope':
      return 'Did this help you feel you could move forward?';
    default:
      return 'What changed, if anything?';
  }
}

export function pickRevisitPrompt(saved: SavedThreadRecord, now: number): GrowthPromptId {
  const ageDays = (now - saved.savedAt) / 86_400_000;
  if (ageDays >= 21) return 'perspective';
  if (ageDays >= 7) return 'used';
  return 'stayed';
}
