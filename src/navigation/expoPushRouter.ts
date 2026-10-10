/** Minimal router surface for Skywrite / My Sky navigation helpers (expo-router compatible). */
export type ExpoPushRouter = {
  push: (href: never) => void;
  replace?: (href: never) => void;
};
