import {
  SKYWRITE_SHOWING_UP_OPTIONS,
  type SkywriteShowingUpId,
} from '@/constants/skywriteCopy';
import type { SkywriteRecord } from '@/skywrite/types';

/** Explicit contribution signals — ordinary activity is never treated as impact. */
const IMPACT_SHOWING_UP_IDS = new Set<SkywriteShowingUpId>(['encouragement']);

const SHOWING_UP_LABELS = Object.fromEntries(
  SKYWRITE_SHOWING_UP_OPTIONS.map((option) => [option.id, option.label]),
) as Record<SkywriteShowingUpId, string>;

export interface SkyImpactActivity {
  id: string;
  sourceId: string;
  title: string;
  createdAt: string;
  showingUp: SkywriteShowingUpId;
}

const MAX_IMPACT_NODES = 4;

function impactTitle(post: SkywriteRecord): string {
  const trimmed = post.text.trim();
  if (trimmed) return trimmed.slice(0, 48);
  const label = post.showingUp ? SHOWING_UP_LABELS[post.showingUp] : null;
  return label ? `${label} moment` : 'Contribution moment';
}

/** Credible impact nodes from explicit Skywrite contribution markers only. */
export function resolveSkyImpactActivities(skywrites: SkywriteRecord[]): SkyImpactActivity[] {
  return skywrites
    .filter(
      (post): post is SkywriteRecord & { showingUp: SkywriteShowingUpId } =>
        Boolean(post.showingUp && IMPACT_SHOWING_UP_IDS.has(post.showingUp)),
    )
    .map((post) => ({
      id: `impact-${post.id}`,
      sourceId: post.id,
      title: impactTitle(post),
      createdAt: post.createdAt,
      showingUp: post.showingUp!,
    }))
    .slice(0, MAX_IMPACT_NODES);
}
