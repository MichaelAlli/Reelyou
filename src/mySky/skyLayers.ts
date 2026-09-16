/** Conceptual My Sky layers — visibility toggled via viewState (future UI). */
export type MySkyLayerId =
  | 'stars'
  | 'constellations'
  | 'communities'
  | 'connections'
  | 'growth'
  | 'impact'
  | 'guidance'
  | 'temporal';

export type MySkyVisibleLayers = Record<MySkyLayerId, boolean>;

/** Calm resting state — stars only; deeper layers available but hidden. */
export const DEFAULT_MY_SKY_VISIBLE_LAYERS: MySkyVisibleLayers = {
  stars: true,
  constellations: false,
  communities: false,
  connections: false,
  growth: false,
  impact: false,
  guidance: false,
  temporal: false,
};

export function isLayerVisible(layers: MySkyVisibleLayers, layer: MySkyLayerId): boolean {
  return layers[layer] ?? false;
}
