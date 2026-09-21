import {
  buildStarDetailView,
  findPatternForNode,
  findSkyNodeById,
} from '@/mySky/buildStarDetailView';
import { resolveMySkyStarPreview } from '@/mySky/mySkyStarPreview';
import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

export interface StarInsightBubbleModel {
  title: string;
  eyebrow: string;
  body: string;
  typeLabel: string | null;
  dateLabel: string | null;
  patternLabel: string | null;
  visibilityLabel: string | null;
  skywriteExcerpt: string | null;
  isBetaExample: boolean;
}

function skywriteExcerptForStar(
  star: MySkyStarDisplay,
  skywrites: SkywriteRecord[],
): string | null {
  if (star.type !== 'skywrite' || !star.sourceId) return null;
  const post = skywrites.find((entry) => entry.id === star.sourceId);
  if (!post) return null;
  const text = post.text?.trim();
  if (!text) return null;
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

/** Canonical bubble detail — merges SkyNode detail with beta fixture copy when sparse. */
export function buildStarInsightBubble(
  star: MySkyStarDisplay,
  nodes: SkyNode[],
  patterns: SkyPattern[],
  skywrites: SkywriteRecord[] = [],
): StarInsightBubbleModel {
  const node = findSkyNodeById(nodes, star.id);
  const pattern = node ? findPatternForNode(patterns, node.id) : findPatternForNode(patterns, star.id);
  const preview = resolveMySkyStarPreview(star, patterns);
  const excerpt = skywriteExcerptForStar(star, skywrites);

  if (!node) {
    return {
      title: preview.title,
      eyebrow: preview.eyebrow ?? 'In your sky',
      body: preview.body,
      typeLabel: star.type ? star.type.charAt(0).toUpperCase() + star.type.slice(1) : null,
      dateLabel: star.timestamp ?? null,
      patternLabel: pattern?.label ?? null,
      visibilityLabel: null,
      skywriteExcerpt: excerpt,
      isBetaExample: true,
    };
  }

  const detail = buildStarDetailView(node, pattern);
  const body =
    detail.context?.trim() ||
    preview.body ||
    'This star is part of your living sky — a marker of meaning still unfolding.';

  const isBetaExample = detail.isSparse && !excerpt;

  return {
    title: detail.title,
    eyebrow: detail.typeLabel,
    body: isBetaExample ? preview.body : body,
    typeLabel: detail.typeLabel,
    dateLabel: detail.dateLabel,
    patternLabel: detail.patternLabel,
    visibilityLabel: detail.visibilityLabel,
    skywriteExcerpt: excerpt,
    isBetaExample,
  };
}
