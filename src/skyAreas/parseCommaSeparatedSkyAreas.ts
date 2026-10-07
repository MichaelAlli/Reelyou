import { normalizeSkyAreaLabel } from '@/skyAreas/skyAreaNormalization';

/** Parse comma-separated custom Sky Area labels (canonical separator: comma). */
export function parseCommaSeparatedSkyAreas(raw: string): string[] {
  const parts = raw.split(',');
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const part of parts) {
    const collapsed = part.trim().replace(/\s+/g, ' ');
    if (!collapsed) continue;
    const norm = normalizeSkyAreaLabel(collapsed);
    if (seen.has(norm)) continue;
    seen.add(norm);
    labels.push(collapsed);
  }
  return labels;
}
