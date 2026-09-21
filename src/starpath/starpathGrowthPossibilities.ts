/** Templates for world-space growth — not part of the locked reference layout. */

export interface GrowthPossibilityTemplate {
  id: string;
  branchId: string;
  categoryId: string;
  anchorNodeId: string;
  /** Ties emergence to StarPath 03 catalog / interaction sources. */
  sourceCatalogNodeId: string;
  kind: 'symbol' | 'portrait';
  ringColor: string;
  icon?: string;
  portraitSeed?: number;
}

export const GROWTH_POSSIBILITY_TEMPLATES: GrowthPossibilityTemplate[] = [
  {
    id: 'gp-learning-path',
    branchId: 'learning',
    categoryId: 'learning',
    anchorNodeId: 'p-blue-1',
    sourceCatalogNodeId: 'p-blue-1',
    kind: 'symbol',
    ringColor: '#5EC8FF',
    icon: '◎',
  },
  {
    id: 'gp-learning-resource',
    branchId: 'learning',
    categoryId: 'learning',
    anchorNodeId: 'p-blue-2',
    sourceCatalogNodeId: 'sym-book',
    kind: 'symbol',
    ringColor: '#5EC8FF',
    icon: '◫',
  },
  {
    id: 'gp-relationships-path',
    branchId: 'relationships',
    categoryId: 'relationships',
    anchorNodeId: 'p-violet-1',
    sourceCatalogNodeId: 'p-violet-1',
    kind: 'symbol',
    ringColor: '#E879A8',
    icon: '◉',
  },
  {
    id: 'gp-growth-path',
    branchId: 'growth',
    categoryId: 'growth',
    anchorNodeId: 'p-green-r1',
    sourceCatalogNodeId: 'sym-growth',
    kind: 'symbol',
    ringColor: '#7EE8A8',
    icon: '✧',
  },
  {
    id: 'gp-community-path',
    branchId: 'community',
    categoryId: 'community',
    anchorNodeId: 'sym-community',
    sourceCatalogNodeId: 'sym-community',
    kind: 'symbol',
    ringColor: '#B794F6',
    icon: '⚭',
  },
];

const byTemplateId = new Map(GROWTH_POSSIBILITY_TEMPLATES.map((t) => [t.id, t]));
const bySourceCatalog = new Map<string, GrowthPossibilityTemplate[]>();

for (const t of GROWTH_POSSIBILITY_TEMPLATES) {
  const list = bySourceCatalog.get(t.sourceCatalogNodeId) ?? [];
  list.push(t);
  bySourceCatalog.set(t.sourceCatalogNodeId, list);
}

export function getGrowthTemplate(id: string): GrowthPossibilityTemplate | undefined {
  return byTemplateId.get(id);
}

export function templatesForCatalogNode(catalogNodeId: string): GrowthPossibilityTemplate[] {
  return bySourceCatalog.get(catalogNodeId) ?? [];
}

export function templatesForBranch(branchId: string): GrowthPossibilityTemplate[] {
  return GROWTH_POSSIBILITY_TEMPLATES.filter((t) => t.branchId === branchId);
}
