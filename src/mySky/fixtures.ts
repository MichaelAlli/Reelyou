import type { MySkyConstellation, MySkyItem } from '@/mySky/types';

/** Beta placeholder stars — replace with backend sky items later. */
export const MY_SKY_ITEM_FIXTURES: MySkyItem[] = [
  {
    id: 'star-1',
    type: 'skywrite',
    title: 'Starting before I feel ready',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'orbit',
    constellationId: 'pattern-creativity',
  },
  {
    id: 'star-2',
    type: 'moment',
    title: 'A quiet morning of clarity',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'private',
    constellationId: 'pattern-growth',
  },
  {
    id: 'star-3',
    type: 'connection',
    title: 'Conversation with Maya',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'orbit',
    constellationId: 'pattern-purpose',
  },
  {
    id: 'star-4',
    type: 'contribution',
    title: 'Encouraged someone in Creativity',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public',
    constellationId: 'pattern-creativity',
  },
  {
    id: 'star-5',
    type: 'skywrite',
    title: 'Trusting the slower path',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'private',
    constellationId: 'pattern-growth',
  },
];

export const MY_SKY_CONSTELLATION_FIXTURES: MySkyConstellation[] = [
  {
    id: 'pattern-creativity',
    label: 'Creative becoming',
    note: 'A pattern is taking shape around expression and making things that matter.',
    itemIds: ['star-1', 'star-4'],
  },
  {
    id: 'pattern-growth',
    label: 'Intentional growth',
    note: 'You’ve returned to this theme a few times — becoming more deliberate.',
    itemIds: ['star-2', 'star-5'],
  },
  {
    id: 'pattern-purpose',
    label: 'Meaningful connection',
    note: 'Moments here often involve people and conversations that matter.',
    itemIds: ['star-3'],
  },
];

/** Canvas positions + colors keyed by star id. */
export const MY_SKY_STAR_LAYOUT: Record<
  string,
  { x: number; y: number; color: string; destination: 'skywrite' | 'public-sky' | null; destinationParam: string | null }
> = {
  'star-1': { x: 0.22, y: 0.28, color: '#C4A8FF', destination: 'skywrite', destinationParam: null },
  'star-2': { x: 0.48, y: 0.18, color: '#8FD4FF', destination: 'skywrite', destinationParam: null },
  'star-3': { x: 0.72, y: 0.32, color: '#F5D76E', destination: 'public-sky', destinationParam: 'orbit-3' },
  'star-4': { x: 0.58, y: 0.55, color: '#5EEAD4', destination: null, destinationParam: null },
  'star-5': { x: 0.32, y: 0.62, color: '#E879A8', destination: 'skywrite', destinationParam: null },
};
