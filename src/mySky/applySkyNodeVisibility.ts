import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';
import {
  resolveEffectiveNodeVisibility,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';

/** Stamp resolved visibility onto nodes — owner graph uses this for indicators; public view filters after. */
export function applyVisibilityToNodes(
  nodes: SkyNode[],
  settings: SkyVisibilitySettings,
): SkyNode[] {
  return nodes.map((node) => {
    if (node.type === 'identity') return node;
    const visibility = resolveEffectiveNodeVisibility(node, settings);
    return visibility === node.visibility ? node : { ...node, visibility };
  });
}

export function applyPatternVisibility(
  patterns: SkyPattern[],
  settings: SkyVisibilitySettings,
): SkyPattern[] {
  const constellationOverride = settings.contentOverrides.constellations;
  if (!constellationOverride) return patterns;

  return patterns.map((pattern) => ({
    ...pattern,
    visibility: constellationOverride,
  }));
}
