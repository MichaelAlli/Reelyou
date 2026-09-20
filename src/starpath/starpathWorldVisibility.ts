import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import type { PortraitNodeSpec, SymbolNodeSpec } from '@/starpath/starpathReferenceLayout';
import type { StarPathNodePresence } from '@/starpath/starpathWorldModel';

export interface StarPathViewportWindow {
  scrollY: number;
  viewportHeight: number;
}

export function classifyNodePresence(
  worldY: number,
  window: StarPathViewportWindow,
): StarPathNodePresence {
  const viewTop = window.scrollY;
  const viewBottom = window.scrollY + window.viewportHeight;
  const margin = window.viewportHeight * 0.22;

  if (worldY >= viewTop - margin && worldY <= viewBottom + margin) {
    const center = (viewTop + viewBottom) / 2;
    const dist = Math.abs(worldY - center) / window.viewportHeight;
    if (dist <= 0.42) return 'focus';
    return 'nearby';
  }

  const far = worldY < viewTop - margin * 2 || worldY > viewBottom + margin * 2;
  return far ? 'summarized' : 'distant';
}

export function presenceToOpacity(presence: StarPathNodePresence): number {
  switch (presence) {
    case 'focus':
      return 1;
    case 'nearby':
      return 0.92;
    case 'distant':
      return 0.62;
    case 'summarized':
      return 0.38;
    default:
      return 1;
  }
}

export interface VisiblePortraitNode extends PortraitNodeSpec {
  worldX: number;
  worldY: number;
  presence: StarPathNodePresence;
  visualOpacity: number;
}

export interface VisibleSymbolNode extends SymbolNodeSpec {
  worldX: number;
  worldY: number;
  presence: StarPathNodePresence;
  visualOpacity: number;
}

/** Density-aware projection — distant nodes soften; nothing is deleted from the graph. */
export function projectVisiblePortraitNodes(
  nodes: PortraitNodeSpec[],
  metrics: StarPathLayoutMetrics,
  window: StarPathViewportWindow,
): VisiblePortraitNode[] {
  return nodes.map((node) => {
    const { x: worldX, y: worldY } = refPointToWorldPx(node, metrics);
    const presence = classifyNodePresence(worldY, window);
    return {
      ...node,
      worldX,
      worldY,
      presence,
      visualOpacity: presenceToOpacity(presence),
    };
  });
}

export function projectVisibleSymbolNodes(
  nodes: SymbolNodeSpec[],
  metrics: StarPathLayoutMetrics,
  window: StarPathViewportWindow,
): VisibleSymbolNode[] {
  return nodes.map((node) => {
    const { x: worldX, y: worldY } = refPointToWorldPx(node, metrics);
    const presence = classifyNodePresence(worldY, window);
    return {
      ...node,
      worldX,
      worldY,
      presence,
      visualOpacity: presenceToOpacity(presence),
    };
  });
}

/** Hide summarized nodes from the live layer to avoid crowding (data remains in graph). */
export function shouldRenderNode(presence: StarPathNodePresence): boolean {
  return presence !== 'summarized';
}
