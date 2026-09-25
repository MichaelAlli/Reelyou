import { deriveStarSemanticFromSkywrite } from '@/starSemantic/deriveStarSemantic';
import type { StarSemantic } from '@/starSemantic/starSemanticTypes';
import type { SkywriteRecord } from '@/skywrite/types';

export interface StarSemanticStoreState {
  bySourceId: Record<string, StarSemantic>;
}

export function createStarSemanticStore(
  initial: StarSemanticStoreState = { bySourceId: {} },
) {
  let state = initial;

  return {
    getState: () => state,
    upsertFromSkywrite(record: SkywriteRecord, options?: Parameters<typeof deriveStarSemanticFromSkywrite>[1]) {
      const semantic = deriveStarSemanticFromSkywrite(record, options);
      state = {
        bySourceId: { ...state.bySourceId, [record.id]: semantic },
      };
      return semantic;
    },
    remove(sourceId: string) {
      if (!state.bySourceId[sourceId]) return;
      const next = { ...state.bySourceId };
      delete next[sourceId];
      state = { bySourceId: next };
    },
    get(sourceId: string): StarSemantic | undefined {
      return state.bySourceId[sourceId];
    },
  };
}

export type StarSemanticStore = ReturnType<typeof createStarSemanticStore>;
