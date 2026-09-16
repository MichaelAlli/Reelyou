import type { AroundYourSkyDisplayItem } from '@/social/aroundYourSky/types';

/**
 * Beta placeholder activity pool — replace with backend feed source later.
 * People and moments are sample-only; not real user data.
 */
export const AROUND_YOUR_SKY_FIXTURES: AroundYourSkyDisplayItem[] = [
  {
    id: 'ays-1',
    type: 'connection',
    actorId: 'orbit-jordan',
    communityId: null,
    contentId: 'skywrite-sample-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relevanceSource: 'connection',
    actorName: 'Jordan',
    actorInitials: 'JO',
    actorColor: '#9B7EDE',
    message: 'Jordan shared a new Skywrite.',
    preview: '“Starting before I feel ready.”',
    relativeTime: '2h ago',
    destination: 'skywrite',
    destinationParam: null,
  },
  {
    id: 'ays-2',
    type: 'community',
    actorId: null,
    communityId: 'creativity',
    contentId: null,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    relevanceSource: 'community',
    actorName: 'Creativity',
    actorInitials: 'CR',
    actorColor: '#5EEAD4',
    message: 'Something new is happening in Creativity.',
    preview: 'A thread on making time for unfinished ideas.',
    relativeTime: '5h ago',
    destination: 'community',
    destinationParam: 'creativity',
  },
  {
    id: 'ays-3',
    type: 'growth',
    actorId: 'orbit-2',
    communityId: null,
    contentId: 'moment-sample-1',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    relevanceSource: 'connection',
    actorName: 'David',
    actorInitials: 'DO',
    actorColor: '#6EE7B7',
    message: 'David reached a meaningful moment on their journey.',
    preview: 'Finished a project they had paused for months.',
    relativeTime: '9h ago',
    destination: 'public-sky',
    destinationParam: 'orbit-2',
  },
  {
    id: 'ays-4',
    type: 'social',
    actorId: 'orbit-3',
    communityId: null,
    contentId: 'moment-sample-2',
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    relevanceSource: 'connection',
    actorName: 'Maya',
    actorInitials: 'MA',
    actorColor: '#F5D76E',
    message: 'Maya shared a moment from her weekend.',
    preview: 'A quiet morning walk and good coffee.',
    relativeTime: 'Yesterday',
    destination: 'public-sky',
    destinationParam: 'orbit-3',
  },
];

/** Set true in dev to preview the quiet Home state. */
export const AROUND_YOUR_SKY_FORCE_QUIET = false;
