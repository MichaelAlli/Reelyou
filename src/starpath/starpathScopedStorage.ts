import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

export async function readStarpathScopedJson<T>(
  baseKey: string,
  parse: (raw: string | null) => T,
): Promise<T> {
  return readScopedJson(baseKey, parse);
}

export async function writeStarpathScopedJson(baseKey: string, value: unknown): Promise<boolean> {
  return writeScopedJson(baseKey, value);
}
