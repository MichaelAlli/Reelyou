export type StarPathNodeKind = 'portrait' | 'symbol';

export interface StarPathNodeCatalogEntry {
  id: string;
  kind: StarPathNodeKind;
  branchId: string;
  title: string;
  subtitle: string;
  whyItMatters: string;
  relatedNodeIds: string[];
  actions: {
    explore?: boolean;
    interested?: boolean;
    dismiss?: boolean;
    save?: boolean;
    viewProfile?: boolean;
    viewSkywrite?: boolean;
    viewCommunity?: boolean;
    viewResource?: boolean;
  };
}

const catalog: StarPathNodeCatalogEntry[] = [
  {
    id: 'p-blue-1',
    kind: 'portrait',
    branchId: 'learning',
    title: 'Learning connection',
    subtitle: 'Someone on your learning lane',
    whyItMatters: 'Shared curiosity can sharpen your next step without rushing you.',
    relatedNodeIds: ['p-blue-2', 'sym-book'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewProfile: true },
  },
  {
    id: 'p-blue-2',
    kind: 'portrait',
    branchId: 'learning',
    title: 'Guide on the path',
    subtitle: 'Learning lane',
    whyItMatters: 'A steady voice can help ideas land when you are ready.',
    relatedNodeIds: ['sym-book'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewProfile: true },
  },
  {
    id: 'sym-book',
    kind: 'symbol',
    branchId: 'learning',
    title: 'Resource milestone',
    subtitle: 'Learning',
    whyItMatters: 'A focused resource can anchor your next reflection.',
    relatedNodeIds: ['p-blue-2'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewResource: true },
  },
  {
    id: 'p-violet-1',
    kind: 'portrait',
    branchId: 'relationships',
    title: 'Relationship connection',
    subtitle: 'Relationships lane',
    whyItMatters: 'Meaningful ties often grow from small, honest moments.',
    relatedNodeIds: ['p-violet-2', 'sym-heart'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewProfile: true },
  },
  {
    id: 'p-violet-2',
    kind: 'portrait',
    branchId: 'relationships',
    title: 'Close orbit',
    subtitle: 'Relationships',
    whyItMatters: 'People who see you clearly can help you choose with care.',
    relatedNodeIds: ['sym-heart'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewProfile: true },
  },
  {
    id: 'sym-heart',
    kind: 'symbol',
    branchId: 'relationships',
    title: 'Heart milestone',
    subtitle: 'Relationships',
    whyItMatters: 'What you nurture in connection shapes your wider sky.',
    relatedNodeIds: ['p-violet-2'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewSkywrite: true },
  },
  {
    id: 'p-green-r1',
    kind: 'portrait',
    branchId: 'growth',
    title: 'Growth companion',
    subtitle: 'Growth lane',
    whyItMatters: 'Shared growth can feel lighter when someone walks beside you.',
    relatedNodeIds: ['sym-growth'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewProfile: true },
  },
  {
    id: 'sym-growth',
    kind: 'symbol',
    branchId: 'growth',
    title: 'Growth milestone',
    subtitle: 'Personal growth',
    whyItMatters: 'Small shifts compound — this marks a place to pause and notice.',
    relatedNodeIds: ['p-green-r1'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewResource: true },
  },
  {
    id: 'sym-community',
    kind: 'symbol',
    branchId: 'community',
    title: 'Community waypoint',
    subtitle: 'Community',
    whyItMatters: 'Belonging can open doors you would not walk alone.',
    relatedNodeIds: ['p-blue-1'],
    actions: { explore: true, interested: true, dismiss: true, save: true, viewCommunity: true },
  },
];

const byId = new Map(catalog.map((e) => [e.id, e]));

export function getStarPathNodeCatalogEntry(nodeId: string): StarPathNodeCatalogEntry | undefined {
  return byId.get(nodeId);
}

export function getAllStarPathNodeIds(): string[] {
  return catalog.map((e) => e.id);
}
