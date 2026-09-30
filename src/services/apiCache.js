const DEFAULT_TTL = 3 * 60 * 1000;

const cache = new Map();

function buildKey(path, params) {
  if (!params || typeof params !== 'object') return path;
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${path}?${sorted}`;
}

export function getCached(path, params) {
  const key = buildKey(path, params);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(path, params, data, ttl = DEFAULT_TTL) {
  const key = buildKey(path, params);
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function invalidateCache(pathPrefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(pathPrefix)) {
      cache.delete(key);
    }
  }
}

export function clearAllCache() {
  cache.clear();
}
