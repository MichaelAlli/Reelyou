type StopListener = () => void;

const listeners = new Set<StopListener>();

export function subscribeProtectedPlaybackStop(listener: StopListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stop SkyReel, preview, and other protected media (e.g. on logout). */
export function stopAllProtectedPlayback(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  }
}
