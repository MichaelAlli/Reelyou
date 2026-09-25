import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';

export interface HomeStarpathPreview {
  branchLabel: string;
  directionTitle: string;
  nextStep: string;
  opportunityHint?: string;
}

/** Lightweight Home preview — canonical catalog only, no fabricated guidance. */
export function buildHomeStarpathPreview(): HomeStarpathPreview {
  const anchor =
    getStarPathNodeCatalogEntry('sym-growth') ?? getStarPathNodeCatalogEntry('p-green-r1');
  const related = anchor?.relatedNodeIds?.[0]
    ? getStarPathNodeCatalogEntry(anchor.relatedNodeIds[0])
    : undefined;

  return {
    branchLabel: anchor?.branchId?.replace(/-/g, ' ') ?? 'Your path',
    directionTitle: anchor?.title ?? 'Your next direction',
    nextStep: anchor?.whyItMatters ?? 'Your StarPath holds your next meaningful step when you are ready.',
    opportunityHint: related?.subtitle,
  };
}
