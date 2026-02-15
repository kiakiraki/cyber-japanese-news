import type { NewsItem } from './types';

interface CacheEntry {
  url: string | null;
  expires: number;
}

const ogpCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const FETCH_TIMEOUT = 10_000; // 10s
const MAX_FETCH_CANDIDATES = 15;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

const OG_IMAGE_RE = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i;
const OG_IMAGE_RE_ALT = /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i;

function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms),
  );
}

async function fetchOgpImageUrl(link: string): Promise<string | null> {
  try {
    const response = await Promise.race([
      fetch(link, { redirect: 'follow' }),
      timeoutPromise(FETCH_TIMEOUT),
    ]);

    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(OG_IMAGE_RE) ?? html.match(OG_IMAGE_RE_ALT);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Select top candidate items for OGP fetching.
 * Mirrors the frontend card selection logic: exclude national, dedupe by prefecture,
 * prioritize breaking news and recency.
 */
function selectFetchCandidates(items: NewsItem[]): NewsItem[] {
  const candidates = items.filter((item) => item.prefectureCode !== 'national');

  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of candidates) {
    if (!seen.has(item.prefectureCode)) {
      seen.add(item.prefectureCode);
      unique.push(item);
    }
  }

  unique.sort((a, b) => {
    if (a.isBreaking !== b.isBreaking) return a.isBreaking ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return unique.slice(0, MAX_FETCH_CANDIDATES);
}

export async function enrichWithOgp(items: NewsItem[]): Promise<NewsItem[]> {
  const now = Date.now();

  // Purge expired entries
  for (const [key, entry] of ogpCache) {
    if (entry.expires < now) {
      ogpCache.delete(key);
    }
  }

  // Only fetch OGP for top display candidates (not all 100+ items)
  const candidates = selectFetchCandidates(items);
  const toFetch = candidates.filter((item) => {
    const cached = ogpCache.get(item.link);
    return !cached || cached.expires < now;
  });

  // Fetch OGP for uncached items (max 3 concurrent)
  if (toFetch.length > 0) {
    await mapWithConcurrency(toFetch, 3, async (item) => {
      const url = await fetchOgpImageUrl(item.link);
      ogpCache.set(item.link, { url, expires: now + CACHE_TTL });
    });
  }

  // Enrich items with cached OGP URLs
  return items.map((item) => {
    const cached = ogpCache.get(item.link);
    if (cached?.url) {
      return { ...item, ogpImageUrl: cached.url };
    }
    return item;
  });
}
