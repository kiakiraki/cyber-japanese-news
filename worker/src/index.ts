import { fetchAllNews, RSS_FEED_COUNT } from './rss-fetcher';
import { fetchJmaData } from './jma-fetcher';
import type { NewsApiResponse, JmaApiResponse } from './types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ブラウザには常に再検証させ(max-age=0)、エッジキャッシュ(s-maxage)だけ効かせる。
// フロントのポーリング間隔(news=60s, jma=30s)より長くしないこと。
const NEWS_EDGE_TTL = 60;
const JMA_EDGE_TTL = 30;

function jsonResponse(body: unknown, init: { status?: number; cacheControl?: string } = {}): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  };
  if (init.cacheControl) {
    headers['Cache-Control'] = init.cacheControl;
  }
  return new Response(JSON.stringify(body), { status: init.status ?? 200, headers });
}

/**
 * エッジキャッシュ経由でレスポンスを返す。
 * produce() が Cache-Control 付きの 2xx を返した場合のみキャッシュに保存する
 * (エラーレスポンスや劣化レスポンスは Cache-Control を付けずに返せばキャッシュされない)。
 */
async function withEdgeCache(
  request: Request,
  ctx: ExecutionContext,
  produce: () => Promise<Response>,
): Promise<Response> {
  const cache = caches.default;
  const hit = await cache.match(request.url);
  if (hit) return hit;

  const response = await produce();
  if (response.ok && response.headers.has('Cache-Control')) {
    ctx.waitUntil(cache.put(request.url, response.clone()));
  }
  return response;
}

async function handleNews(url: URL): Promise<Response> {
  try {
    let news = await fetchAllNews();

    const prefectureFilter = url.searchParams.get('prefecture');
    if (prefectureFilter) {
      news = news.filter((item) => item.prefectureCode === prefectureFilter);
    }

    const body: NewsApiResponse = {
      news,
      fetchedAt: new Date().toISOString(),
      feedCount: RSS_FEED_COUNT,
    };

    return jsonResponse(body, {
      cacheControl: `public, max-age=0, s-maxage=${NEWS_EDGE_TTL}`,
    });
  } catch (error) {
    console.error('[/api/news] Failed to fetch news:', error);
    return jsonResponse({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

async function handleJma(): Promise<Response> {
  // fetchJmaData はソース単位で部分失敗を許容する(失敗は sources に反映される)ので、
  // 全滅時も 200 で空データを返し、フロントは前回データを保持したまま stale 表示にする。
  let data: Awaited<ReturnType<typeof fetchJmaData>>;
  try {
    data = await fetchJmaData();
  } catch (error) {
    console.error('[/api/jma] Failed to fetch JMA data:', error);
    data = {
      earthquakes: [],
      tsunamis: [],
      warnings: [],
      sources: { p2pquake: 'error', jmaWarning: 'error' },
    };
  }

  const body: JmaApiResponse = {
    earthquakes: data.earthquakes,
    tsunamis: data.tsunamis,
    warnings: data.warnings,
    meta: {
      lastUpdated: new Date().toISOString(),
      sources: data.sources,
    },
  };

  // ソースが一部でも落ちている場合はキャッシュしない(復旧を次のリクエストで拾うため)
  const degraded = data.sources.p2pquake === 'error' || data.sources.jmaWarning === 'error';
  return jsonResponse(body, {
    cacheControl: degraded ? undefined : `public, max-age=0, s-maxage=${JMA_EDGE_TTL}`,
  });
}

export default {
  async fetch(request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/news' && request.method === 'GET') {
      return withEdgeCache(request, ctx, () => handleNews(url));
    }

    if (url.pathname === '/api/jma' && request.method === 'GET') {
      return withEdgeCache(request, ctx, handleJma);
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
};
