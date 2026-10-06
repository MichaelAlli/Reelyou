type SignOutCleanup = () => void;

const cleanups = new Set<SignOutCleanup>();

/** Register in-memory cache resets — runs before auth tokens are cleared on sign out. */
export function registerSignOutCleanup(fn: SignOutCleanup): () => void {
  cleanups.add(fn);
  return () => {
    cleanups.delete(fn);
  };
}

export function runSignOutCleanups(): void {
  for (const fn of cleanups) {
    try {
      fn();
    } catch {
      // Non-blocking — sign out must continue.
    }
  }
}
