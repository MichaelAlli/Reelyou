/** In-memory AsyncStorage for Node/tsx tests. */
const store = new Map<string, string>();

const AsyncStorage = {
  getItem: async (key: string) => store.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: async (key: string) => {
    store.delete(key);
  },
  clear: async () => {
    store.clear();
  },
  getAllKeys: async () => [...store.keys()],
  multiGet: async (keys: string[]) => keys.map((k) => [k, store.get(k) ?? null] as const),
  multiSet: async (pairs: [string, string][]) => {
    for (const [k, v] of pairs) store.set(k, v);
  },
  multiRemove: async (keys: string[]) => {
    for (const k of keys) store.delete(k);
  },
};

export default AsyncStorage;
