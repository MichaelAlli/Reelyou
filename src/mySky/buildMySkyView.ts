import {
  MY_SKY_CONSTELLATION_FIXTURES,
  MY_SKY_ITEM_FIXTURES,
  MY_SKY_STAR_LAYOUT,
} from '@/mySky/fixtures';
import type { MySkyState, MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Build My Sky view from centralized profile — fixtures until backend connects. */
export function buildMySkyView(profile: UserPersonalizationProfile): MySkyView {
  const skyItems = MY_SKY_ITEM_FIXTURES;
  const constellations = MY_SKY_CONSTELLATION_FIXTURES;

  const connections = profile.communities.joined.map((c) => c.name);
  const contributions = skyItems
    .filter((item) => item.type === 'contribution')
    .map((item) => item.title)
    .filter((title): title is string => Boolean(title));

  const state: MySkyState = {
    northStar: { originalVision: profile.northStar.originalVision },
    skyItems,
    constellations,
    connections,
    contributions,
  };

  const stars = skyItems.map((item) => {
    const layout = MY_SKY_STAR_LAYOUT[item.id] ?? {
      x: 0.5,
      y: 0.5,
      color: '#E8C872',
      destination: null,
      destinationParam: null,
    };
    return { ...item, ...layout };
  });

  return { ...state, stars };
}
