import type {
  StarPathInteractionSignal,
  StarPathInteractionType,
  StarPathNodeUiState,
} from '@/starpath/starpathInteractionTypes';

const PRIORITY: StarPathInteractionType[] = [
  'dismissed',
  'selected',
  'saved',
  'interested',
  'explored',
  'viewed',
];

export function deriveNodeUiState(
  nodeId: string,
  signals: StarPathInteractionSignal[],
): StarPathNodeUiState {
  const forNode = signals.filter((s) => s.nodeId === nodeId);
  if (!forNode.length) return 'neutral';

  const latestByType = new Map<StarPathInteractionType, StarPathInteractionSignal>();
  for (const s of forNode) {
    const prev = latestByType.get(s.interactionType);
    if (!prev || s.timestamp >= prev.timestamp) latestByType.set(s.interactionType, s);
  }

  for (const type of PRIORITY) {
    const rec = latestByType.get(type);
    if (!rec) continue;
    if (rec.reversed) continue;
    if (type === 'dismissed') return 'dismissed';
    if (type === 'selected') return 'selected';
    if (type === 'saved') return 'saved';
    if (type === 'interested') return 'interested';
    if (type === 'explored') return 'explored';
    if (type === 'viewed') return 'viewed';
  }
  return 'neutral';
}

export function createSignal(
  partial: Omit<StarPathInteractionSignal, 'id' | 'timestamp'> & { timestamp?: number },
): StarPathInteractionSignal {
  return {
    id: `${partial.nodeId}-${partial.interactionType}-${Date.now()}`,
    timestamp: partial.timestamp ?? Date.now(),
    ...partial,
  };
}

/** Replace conflicting explicit choice on same node (interested vs dismissed). */
export function appendSignalDeduped(
  signals: StarPathInteractionSignal[],
  next: StarPathInteractionSignal,
): StarPathInteractionSignal[] {
  const exclusive: StarPathInteractionType[] = ['interested', 'dismissed', 'selected', 'saved'];
  let filtered = signals;
  if (exclusive.includes(next.interactionType)) {
    filtered = signals.filter(
      (s) =>
        !(
          s.nodeId === next.nodeId &&
          exclusive.includes(s.interactionType) &&
          s.interactionType !== next.interactionType &&
          !s.reversed
        ),
    );
  }
  return [...filtered, next];
}

export function nodeVisualModifiers(ui: StarPathNodeUiState): {
  opacity: number;
  ringScale: number;
  glowBoost: number;
  showSelectionRing: boolean;
  softPulse: boolean;
} {
  switch (ui) {
    case 'dismissed':
      return { opacity: 0.38, ringScale: 1, glowBoost: 0, showSelectionRing: false, softPulse: false };
    case 'selected':
      return { opacity: 1, ringScale: 1.06, glowBoost: 0.22, showSelectionRing: true, softPulse: true };
    case 'saved':
      return { opacity: 0.96, ringScale: 1.04, glowBoost: 0.16, showSelectionRing: true, softPulse: false };
    case 'interested':
      return { opacity: 1, ringScale: 1.05, glowBoost: 0.2, showSelectionRing: true, softPulse: true };
    case 'explored':
      return { opacity: 0.88, ringScale: 1, glowBoost: 0.08, showSelectionRing: false, softPulse: false };
    case 'viewed':
      return { opacity: 0.94, ringScale: 1, glowBoost: 0.05, showSelectionRing: false, softPulse: false };
    default:
      return { opacity: 1, ringScale: 1, glowBoost: 0, showSelectionRing: false, softPulse: false };
  }
}
