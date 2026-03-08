import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NewsItem, NewsApiResponse } from '../types/news';
import { fetchWithRetry } from '../lib/fetchUtils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const POLL_INTERVAL = 60_000;

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (USE_MOCK) {
      const { MOCK_NEWS } = await import('../lib/mockNews');
      setNews(MOCK_NEWS);
      setLastUpdated(new Date());
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await fetchWithRetry<NewsApiResponse>(`${API_URL}/api/news`);
      setNews(data.news);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

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
    lastUpdated,
    isLoading,
    error,
  };
}
