/** Normalize Sky Area labels for duplicate detection and reuse. */
export function normalizeSkyAreaLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');
}

export function skyAreaSlugFromLabel(label: string): string {
  return normalizeSkyAreaLabel(label)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export function normalizeHashtagTag(raw: string): string {
  const stripped = raw.trim().replace(/^#+/, '').toLowerCase();
  return stripped.replace(/[^a-z0-9_-]/g, '').replace(/_/g, '-');
}

export interface SkywriteHashtag {
  displayTag: string;
  normalizedTag: string;
}

export function toSkywriteHashtag(raw: string): SkywriteHashtag | null {
  const display = raw.trim().replace(/^#+/, '');
  if (!display) return null;
  const normalizedTag = normalizeHashtagTag(display);
  if (!normalizedTag) return null;
  return { displayTag: display, normalizedTag };
}

export function normalizeHashtagList(tags: readonly string[]): SkywriteHashtag[] {
  const seen = new Set<string>();
  const out: SkywriteHashtag[] = [];
  for (const tag of tags) {
    const parsed = toSkywriteHashtag(tag);
    if (!parsed || seen.has(parsed.normalizedTag)) continue;
    seen.add(parsed.normalizedTag);
    out.push(parsed);
  }
  return out;
}
