import type { SkywriteRecord } from '@/skywrite/types';

type Listener = (record: SkywriteRecord) => void;

const listeners = new Set<Listener>();

export function subscribeSkywriteLocalRecordSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Push a repaired/updated post into local owner library state. */
export function syncSkywriteLocalRecord(record: SkywriteRecord): void {
  for (const listener of listeners) {
    try {
      listener(record);
    } catch {
      // ignore
    }
  }
}
