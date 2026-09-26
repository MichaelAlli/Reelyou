export type SkywritePlayStepKind = 'text' | 'photo' | 'audio';

export interface SkywritePlayStep {
  stepId: string;
  skywriteId: string;
  kind: SkywritePlayStepKind;
}

export type SkywritePlayScope = 'focused' | 'single';

export interface FocusedSkyPlaySequenceConfig {
  /** Skywrite ids in play order; omitted ids use default append order. */
  orderedSkywriteIds: string[];
  excludedSkywriteIds: string[];
}

export interface SingleSkywritePlayConfig {
  orderedStepIds: string[];
  excludedStepIds: string[];
}

export interface SkywritePlaySequenceState {
  focusedSky: FocusedSkyPlaySequenceConfig;
  singleBySkywriteId: Record<string, SingleSkywritePlayConfig>;
  updatedAt: number;
}

export const EMPTY_SKYWRITE_PLAY_SEQUENCE: SkywritePlaySequenceState = {
  focusedSky: {
    orderedSkywriteIds: [],
    excludedSkywriteIds: [],
  },
  singleBySkywriteId: {},
  updatedAt: 0,
};
