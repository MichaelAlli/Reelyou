import type { PersonalizationPreferences } from '@/preferences/userPreferencesTypes';
import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';

export function gateTodayFocusText(
  text: string | null | undefined,
  prefs: PersonalizationPreferences,
): string | null {
  if (!prefs.useTodaysFocus) return null;
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
}

export function gateInteractionSignals(
  signals: StarPathInteractionSignal[],
  prefs: PersonalizationPreferences,
): StarPathInteractionSignal[] {
  if (prefs.useActivityPatterns) return signals;
  return signals.filter((s) => s.interactionType === 'selected' || s.interactionType === 'saved');
}

export function gateSavedNodeIds(ids: string[], prefs: PersonalizationPreferences): string[] {
  return prefs.useSavedItems ? ids : [];
}

export function gateExplicitInterests(ids: string[], prefs: PersonalizationPreferences): string[] {
  return prefs.useExplicitInterests ? ids : [];
}

export function gateStarPathBranchIds(ids: string[], prefs: PersonalizationPreferences): string[] {
  return prefs.useStarPathBranches ? ids : [];
}
