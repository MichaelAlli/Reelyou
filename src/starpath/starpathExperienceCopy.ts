import type { StarPathInteractionSnapshot } from '@/starpath/starpathInteractionTypes';
import { deriveNodeUiState } from '@/starpath/starpathInteractionLogic';

export function pickGuideReaction(snapshot: StarPathInteractionSnapshot): string | null {
  const { signals } = snapshot;
  if (!signals.length) return null;

  const recent = [...signals].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  const last = recent[0];
  if (!last) return null;

  if (last.interactionType === 'interested' && !last.reversed) {
    return 'You seem drawn to this area. Want to explore what connects these?';
  }
  if (last.interactionType === 'saved' && !last.reversed) {
    return 'This may be worth revisiting later when you have a quiet moment.';
  }
  if (last.interactionType === 'explored') {
    return 'Want to explore what connects these?';
  }
  if (last.interactionType === 'dismissed' && !last.reversed) {
    return 'You can always change your mind — saved paths stay open.';
  }

  const interestedCount = signals.filter((s) => s.interactionType === 'interested' && !s.reversed).length;
  if (interestedCount >= 2) {
    return 'You seem drawn to this area.';
  }
  return null;
}

export function pickNextStepSuggestion(snapshot: StarPathInteractionSnapshot): {
  title: string;
  actionLabel: string;
} {
  const recent = [...snapshot.signals].sort((a, b) => b.timestamp - a.timestamp)[0];
  if (!recent) {
    return { title: 'Share a reflection', actionLabel: 'Open Skywrite' };
  }

  const ui = deriveNodeUiState(recent.nodeId, snapshot.signals);
  if (ui === 'interested' || recent.interactionType === 'interested') {
    return { title: 'Explore one possibility', actionLabel: 'Stay on path' };
  }
  if (ui === 'saved' || recent.interactionType === 'saved') {
    return { title: 'Save something that matters', actionLabel: 'Review saved' };
  }
  if (ui === 'dismissed' || recent.interactionType === 'dismissed') {
    return { title: 'Dismiss what doesn’t fit', actionLabel: 'Keep exploring' };
  }
  if (recent.branchId) {
    return { title: 'Follow a branch that feels relevant', actionLabel: 'Next small step' };
  }
  return { title: 'Share a reflection', actionLabel: 'Open Skywrite' };
}
