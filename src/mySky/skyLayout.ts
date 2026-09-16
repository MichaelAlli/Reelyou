import type { SkyNodePosition } from '@/mySky/skyNodeTypes';

/** Stable layout registry — fixture / seeded node positions by id. */
export const SKY_NODE_LAYOUT_REGISTRY: Record<string, SkyNodePosition & { color: string }> = {
  'star-1': { x: 0.46, y: 0.34, color: '#FFD57A' },
  'star-2': { x: 0.5, y: 0.4, color: '#FFB347' },
  'star-3': { x: 0.54, y: 0.36, color: '#FFF4D6' },
  'star-4': { x: 0.48, y: 0.44, color: '#E8C872' },
  'star-5': { x: 0.52, y: 0.42, color: '#FFD57A' },
};

/** Slots for dynamic skywrite nodes — assigned by stable index, not random per render. */
export const SKYWRITE_POSITION_SLOTS: ReadonlyArray<SkyNodePosition & { color: string }> = [
  { x: 0.48, y: 0.38, color: '#FFD57A' },
  { x: 0.52, y: 0.42, color: '#FFB347' },
  { x: 0.44, y: 0.44, color: '#FFF4D6' },
  { x: 0.56, y: 0.36, color: '#E8C872' },
  { x: 0.5, y: 0.46, color: '#FFD57A' },
];

/** Resolve stable position for a node id — registry first, then deterministic slot. */
export function resolveSkyNodePosition(
  nodeId: string,
  slotIndex: number,
): SkyNodePosition & { color: string } {
  const fixed = SKY_NODE_LAYOUT_REGISTRY[nodeId];
  if (fixed) return fixed;
  const slot = SKYWRITE_POSITION_SLOTS[slotIndex % SKYWRITE_POSITION_SLOTS.length];
  return slot;
}
