import { createContext, useContext } from 'react';

export interface SpatialFocusContextValue {
  clearFocus: () => void;
}

const SpatialFocusContext = createContext<SpatialFocusContextValue | null>(null);

export const SpatialFocusContextProvider = SpatialFocusContext.Provider;

export function useSpatialFocusInteractionClear(): (() => void) | null {
  const ctx = useContext(SpatialFocusContext);
  return ctx?.clearFocus ?? null;
}
