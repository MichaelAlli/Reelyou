import { compareSkySearchResultsForExplore, sortOwnerIdsByRecentActivity } from '@/mySky/mySkyExploreSocialOrder';
import type { SkySearchResult } from '@/mySky/skySearchSources';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const feed: AroundYourSkyHomeFeed = {
  isQuiet: false,
  items: [
    {
      id: '1',
      type: 'social',
      actorId: 'user-b',
      communityId: null,
      contentId: null,
      timestamp: new Date(Date.now() - 60_000).toISOString(),
      relevanceSource: null,
      actorName: 'B',
      actorInitials: 'B',
      actorColor: '#fff',
      message: '',
      preview: null,
      relativeTime: '1m',
      destination: null,
      destinationParam: null,
    },
    {
      id: '2',
      type: 'social',
      actorId: 'user-a',
      communityId: null,
      contentId: null,
      timestamp: new Date(Date.now() - 3_600_000).toISOString(),
      relevanceSource: null,
      actorName: 'A',
      actorInitials: 'A',
      actorColor: '#fff',
      message: '',
      preview: null,
      relativeTime: '1h',
      destination: null,
      destinationParam: null,
    },
  ],
};

assert(
  sortOwnerIdsByRecentActivity(['user-a', 'user-b'], feed)[0] === 'user-b',
  'recent activity sorts first',
);

const base = (id: string, context: SkySearchResult['connectionContext']): SkySearchResult => ({
  id,
  name: id,
  subtitle: '',
  bioLine: '',
  avatarInitials: 'X',
  avatarColor: '#000',
  contextLabel: context,
  connectionContext: context,
  isConnected: context !== 'discoverable',
  publicSkyId: id,
  canViewSky: true,
});

const following = new Set(['user-followed']);
const followed = base('user-followed', 'discoverable');
const stranger = base('user-stranger', 'discoverable');
assert(
  compareSkySearchResultsForExplore(followed, stranger, feed, following) < 0,
  'followed sky ranks before other public skies',
);

console.log('[mySkyExploreSocialOrder.test] ok');
