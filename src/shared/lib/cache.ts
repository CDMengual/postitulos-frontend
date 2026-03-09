// utils/cache.ts
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type CacheOptions = {
  ttl?: number; // ms
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const now = Date.now();
  const ttl = options?.ttl ?? Infinity;

  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;

  const promise = (async () => {
    const data = await fetcher();
    memoryCache.set(key, { data, timestamp: Date.now() });
    return data;
  })().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export function invalidateCache(key: string) {
  memoryCache.delete(key);
}

export function clearCache() {
  memoryCache.clear();
  inflight.clear();
}
