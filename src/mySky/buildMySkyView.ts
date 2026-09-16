import {
  MY_SKY_CONSTELLATION_FIXTURES,
  MY_SKY_ITEM_FIXTURES,
  MY_SKY_STAR_LAYOUT,
} from '@/mySky/fixtures';
import type { MySkyState, MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

function skywriteTitle(text: string, mediaMode: string): string {
  const trimmed = text.trim();
  if (trimmed) return trimmed.slice(0, 48);
  if (mediaMode === 'photo_voiceover') return 'Photo with voiceover';
  if (mediaMode === 'photo') return 'Photo moment';
  if (mediaMode === 'voice') return 'Voice moment';
  return 'Skywrite';
}

/** Build My Sky view from centralized profile — fixtures until backend connects. */
export function buildMySkyView(profile: UserPersonalizationProfile): MySkyView {
  const skywriteItems = profile.skywrites.map((post) => ({
    id: `star-${post.id}`,
    type: 'skywrite' as const,
    title: skywriteTitle(post.text, post.mediaMode),
    timestamp: post.createdAt,
    visibility: post.visibility,
    sourceId: post.id,
    mediaMode: post.mediaMode,
  }));
  const skyItems = [...skywriteItems, ...MY_SKY_ITEM_FIXTURES];
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
