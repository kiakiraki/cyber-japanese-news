import { useState, useEffect, useRef, useMemo } from 'react';
import type { NewsItem, NewsApiResponse } from '../types/news';
import { fetchWithRetry } from '../lib/fetchUtils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const POLL_INTERVAL = 60_000;
const MOCK_FEED_COUNT = 7;

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [feedCount, setFeedCount] = useState(MOCK_FEED_COUNT);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function fetchNews() {
      if (USE_MOCK) {
        const { MOCK_NEWS } = await import('../lib/mockNews');
        setNews(MOCK_NEWS);
        setLastUpdated(new Date());
        setFeedCount(MOCK_FEED_COUNT);
        setIsLoading(false);
        setHasLoaded(true);
        return;
      }

      // Abort previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setError(null);
        const data = await fetchWithRetry<NewsApiResponse>(`${API_URL}/api/news`, {
          signal: controller.signal,
        });
        setNews(data.news);
        setLastUpdated(new Date(data.fetchedAt));
        setFeedCount(data.feedCount);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    }

    fetchNews();
    const interval = setInterval(fetchNews, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  const newsByPrefecture = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    for (const item of news) {
      const existing = map.get(item.prefectureCode) ?? [];
      existing.push(item);
      map.set(item.prefectureCode, existing);
    }
    return map;
  }, [news]);

  return {
    news,
    newsByPrefecture,
    totalCount: news.length,
    feedCount,
    lastUpdated,
    isLoading,
    hasLoaded,
    error,
  };
}
