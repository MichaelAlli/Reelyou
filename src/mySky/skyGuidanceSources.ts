import type { GuidingLightRecord } from '@/guidingLight/types';

export interface SkyGuidanceSource {
  id: string;
  title: string;
  supportingText: string | null;
  createdAt: string;
}

/** Active guiding light as a single explicit guidance node — no recommendation feed. */
export function resolveSkyGuidanceSource(
  light: GuidingLightRecord | null | undefined,
): SkyGuidanceSource | null {
  if (!light) return null;
  const title = light.title?.trim();
  if (!title) return null;

  return {
    id: light.id ?? 'guidance-active',
    title: title.slice(0, 48),
    supportingText: light.supportingText?.trim() || null,
    createdAt: light.createdAt ?? new Date().toISOString(),
  };
}
