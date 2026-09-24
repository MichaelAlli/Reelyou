import { DEFAULT_SKY_AREAS } from '@/skyAreas/skyAreaDefinition';
import { normalizeHashtagList, normalizeSkyAreaLabel } from '@/skyAreas/skyAreaNormalization';
import type { SkyArea } from '@/skyAreas/skyAreaDefinition';

/** Suggestion only — never mutates user Sky Areas without explicit approval. */
export interface SkyAreaHashtagSuggestion {
  suggestedLabel: string;
  reason: string;
}

const HASHTAG_HINTS: ReadonlyArray<{ tags: string[]; label: string }> = [
  { tags: ['careerchange', 'interview', 'newcareer', 'jobsearch'], label: 'Career Transition' },
  { tags: ['grief', 'loss'], label: 'Grief' },
  { tags: ['fatherhood', 'motherhood', 'parenting'], label: 'Caregiving' },
  { tags: ['startingover', 'newchapter'], label: 'Starting Over' },
];

function userHasSelectedAreaLabel(
  catalog: readonly SkyArea[],
  selectedAreaIds: readonly string[],
  label: string,
): boolean {
  const norm = normalizeSkyAreaLabel(label);
  return catalog.some(
    (area) =>
      selectedAreaIds.includes(area.id) && normalizeSkyAreaLabel(area.label) === norm,
  );
}

export function detectSkyAreaSuggestionFromHashtags(
  hashtags: readonly string[],
  catalog: readonly SkyArea[],
  selectedAreaIds: readonly string[] = [],
): SkyAreaHashtagSuggestion | null {
  const normalized = normalizeHashtagList(hashtags).map((entry) => entry.normalizedTag);
  if (normalized.length === 0) return null;

  for (const hint of HASHTAG_HINTS) {
    const hit = hint.tags.some((tag) => normalized.includes(tag));
    if (!hit) continue;
    if (userHasSelectedAreaLabel(catalog, selectedAreaIds, hint.label)) return null;
    return {
      suggestedLabel: hint.label,
      reason: `Your Guide noticed ${hint.label} has been coming up in what you've shared.`,
    };
  }

  for (const tag of normalized) {
    const defaultMatch = DEFAULT_SKY_AREAS.find(
      (area) => normalizeSkyAreaLabel(area.label) === normalizeSkyAreaLabel(tag),
    );
    if (defaultMatch) {
      if (selectedAreaIds.includes(defaultMatch.id)) continue;
      return {
        suggestedLabel: defaultMatch.label,
        reason: `Your Guide noticed ${defaultMatch.label} has been coming up in what you've shared.`,
      };
    }
  }

  return null;
}

/** Secondary relevance boost only — must not route invitations alone. */
export function hashtagContextBoost(
  skywriteTags: readonly string[],
  recipientTags: readonly string[],
): number {
  const a = new Set(normalizeHashtagList(skywriteTags).map((t) => t.normalizedTag));
  const b = new Set(normalizeHashtagList(recipientTags).map((t) => t.normalizedTag));
  let overlap = 0;
  for (const tag of a) {
    if (b.has(tag)) overlap += 1;
  }
  return overlap > 0 ? Math.min(0.15, overlap * 0.05) : 0;
}
