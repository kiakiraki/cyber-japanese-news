import { fetchAllNews } from './rss-fetcher';
import { fetchJmaData } from './jma-fetcher';
import type { NewsApiResponse, JmaApiResponse } from './types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/news' && request.method === 'GET') {
      try {
        let news = await fetchAllNews();

        const prefectureFilter = url.searchParams.get('prefecture');
        if (prefectureFilter) {
          news = news.filter((item) => item.prefectureCode === prefectureFilter);
        }

        const body: NewsApiResponse = {
          news,
          fetchedAt: new Date().toISOString(),
        };

        return new Response(JSON.stringify(body), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...CORS_HEADERS,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch news' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
            },
          }
        );
      }
    }

    if (url.pathname === '/api/jma' && request.method === 'GET') {
      try {
        const { earthquakes, tsunamis, warnings, sources } = await fetchJmaData();

        const body: JmaApiResponse = {
          earthquakes,
          tsunamis,
          warnings,
          meta: {
            lastUpdated: new Date().toISOString(),
            sources,
          },
        };

        return new Response(JSON.stringify(body), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
            ...CORS_HEADERS,
          },
        });
      } catch (error) {
        const body: JmaApiResponse = {
          earthquakes: [],
          tsunamis: [],
          warnings: [],
          meta: {
            lastUpdated: new Date().toISOString(),
            sources: {
              p2pquake: 'error',
              jmaWarning: 'error',
            },
          },
        };

        return new Response(JSON.stringify(body), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
};
