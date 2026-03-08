import type { NewsItem } from './types';

const OGP_CACHE_PREFIX = 'https://ogp-cache.internal/';
const CACHE_TTL = 3600; // 1 hour (seconds)
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

async function getCachedOgp(link: string): Promise<string | null | undefined> {
  try {
    const cache = caches.default;
    const key = new Request(`${OGP_CACHE_PREFIX}${encodeURIComponent(link)}`);
    const response = await cache.match(key);
    if (!response) return undefined; // not cached
    const data = await response.json<{ url: string | null }>();
    return data.url;
  } catch {
    return undefined;
  }
}

async function setCachedOgp(link: string, url: string | null): Promise<void> {
  try {
    const cache = caches.default;
    const key = new Request(`${OGP_CACHE_PREFIX}${encodeURIComponent(link)}`);
    const response = new Response(JSON.stringify({ url }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });
    await cache.put(key, response);
  } catch {
    // Cache write failure is non-critical
  }
}

async function fetchOgpImageUrl(link: string): Promise<string | null> {
  try {
    const response = await fetch(link, {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

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
  const candidates = items.filter(
    (item) => item.prefectureCode !== 'national' && !item.link.startsWith('https://news.google.com/'),
  );

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
  // Only fetch OGP for top display candidates (not all 100+ items)
  const candidates = selectFetchCandidates(items);

  // Check cache and find items that need fetching
  const cacheResults = await mapWithConcurrency(candidates, 5, async (item) => {
    const cached = await getCachedOgp(item.link);
    return { item, cached };
  });

  const toFetch = cacheResults
    .filter((r) => r.cached === undefined)
    .map((r) => r.item);

  // Build a link -> url map from cache hits
  const ogpMap = new Map<string, string | null>();
  for (const r of cacheResults) {
    if (r.cached !== undefined) {
      ogpMap.set(r.item.link, r.cached);
    }
  }

  // Fetch OGP for uncached items (max 3 concurrent)
  if (toFetch.length > 0) {
    await mapWithConcurrency(toFetch, 3, async (item) => {
      const url = await fetchOgpImageUrl(item.link);
      ogpMap.set(item.link, url);
      await setCachedOgp(item.link, url);
    });
  }

  // Enrich items with OGP URLs
  return items.map((item) => {
    const url = ogpMap.get(item.link);
    if (url) {
      return { ...item, ogpImageUrl: url };
    }
    return item;
  });
}
