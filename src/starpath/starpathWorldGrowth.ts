import type { SymbolNodeSpec } from '@/starpath/starpathReferenceLayout';
import { STARPATH_BRANCH_COLORS } from '@/starpath/starpathTheme';
import type { StarPathGrowthSignal, StarPathWorldGraph } from '@/starpath/starpathWorldModel';
import { extendBranchWithWaypoint, insertSymbolNode } from '@/starpath/starpathWorldModel';

/**
 * Applies meaningful activity signals to the world graph without scores or diagnostics.
 * Beta: conservative — only extends branches / adds nodes when a ref point is provided.
 */
export function applyGrowthSignals(
  graph: StarPathWorldGraph,
  signals: StarPathGrowthSignal[],
): StarPathWorldGraph {
  let next = graph;

  for (const signal of signals) {
    if (signal.branchId && signal.suggestedRefPoint) {
      next = extendBranchWithWaypoint(next, signal.branchId, signal.suggestedRefPoint);
    }

    if (signal.suggestedRefPoint && signal.symbolIcon) {
      const branchId = signal.branchId ?? 'growth';
      const color =
        STARPATH_BRANCH_COLORS[branchId as keyof typeof STARPATH_BRANCH_COLORS] ?? '#E8C872';
      const node: SymbolNodeSpec = {
        id: `sym-emerged-${signal.id}`,
        x: signal.suggestedRefPoint.x,
        y: signal.suggestedRefPoint.y,
        ringColor: color,
        icon: signal.symbolIcon,
        branchId,
        size: 'md',
      };
      next = insertSymbolNode(next, node);
    }
  }

  return next;
}
