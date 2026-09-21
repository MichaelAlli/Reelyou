import { SPATIAL_LAYOUT } from '@/starpath/starpathDynamicWorldConfig';
import type { JourneyNode } from '@/starpath/starpathDynamicWorldTypes';

/** FNV-1a — deterministic, no Math.random(). */
export function stableHash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export function deterministicGrowthRefPoint(
  stableKey: string,
  branchId: string,
  slotIndex: number,
  existing: JourneyNode[],
): { refX: number; refY: number } {
  const h = stableHash01(stableKey);
  const h2 = stableHash01(`${stableKey}:${branchId}:${slotIndex}`);
  const left = (SPATIAL_LAYOUT.leftBranchIds as readonly string[]).includes(branchId);
  let refX = left ? 0.14 + h * 0.14 : 0.86 - h * 0.14;
  let refY = SPATIAL_LAYOUT.growthRefYMin + slotIndex * SPATIAL_LAYOUT.minRefSpacingY + h2 * 0.04;
  refY = Math.min(refY, SPATIAL_LAYOUT.growthRefYMax);

  for (const other of existing) {
    const dx = Math.abs(other.refX - refX);
    const dy = Math.abs(other.refY - refY);
    if (dx < SPATIAL_LAYOUT.minRefSpacingX && dy < SPATIAL_LAYOUT.minRefSpacingY) {
      refY += SPATIAL_LAYOUT.minRefSpacingY;
    }
  }

  return { refX, refY };
}

export function stableDynamicNodeId(templateId: string, sourceId: string): string {
  return `dyn-${templateId}-${sourceId}`;
}
