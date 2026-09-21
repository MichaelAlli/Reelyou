import type { MySkyStarDisplay } from '@/mySky/types';

/** Stars visible on Focused Skywrite Sky when opening composer (bottom-nav route). */
let pendingStars: MySkyStarDisplay[] | null = null;

export function stageFocusedSkywriteComposeStars(stars: MySkyStarDisplay[]): void {
  pendingStars = stars;
}

export function takeFocusedSkywriteComposeStars(): MySkyStarDisplay[] | null {
  const stars = pendingStars;
  pendingStars = null;
  return stars;
}
