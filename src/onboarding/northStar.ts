/** North Star vision captured on onboarding Screen 4 — stored verbatim. */
export interface NorthStarData {
  /** User's exact words — never summarized, rewritten, or modified. */
  originalVision: string;
}

export const EMPTY_NORTH_STAR: NorthStarData = {
  originalVision: '',
};

export const MAX_NORTH_STAR_VISION_LENGTH = 500;
