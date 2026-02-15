import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsItem } from '../types/news';

const BREAKING_DISPLAY_DURATION = 20_000;

export function useBreakingDetection(news: NewsItem[]) {
  const [breakingQueue, setBreakingQueue] = useState<NewsItem[]>([]);
  const [currentBreaking, setCurrentBreaking] = useState<NewsItem | null>(null);
  const shownIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const newBreaking = news.filter(
      (item) => item.isBreaking && !shownIdsRef.current.has(item.id)
    );

    if (newBreaking.length > 0) {
      setBreakingQueue((prev) => [...prev, ...newBreaking]);
      for (const item of newBreaking) {
        shownIdsRef.current.add(item.id);
      }
    }
  }, [news]);

  useEffect(() => {
    if (!currentBreaking && breakingQueue.length > 0) {
      setCurrentBreaking(breakingQueue[0]);
      setBreakingQueue((prev) => prev.slice(1));
    }
  }, [currentBreaking, breakingQueue]);

  useEffect(() => {
    if (!currentBreaking) return;

    const timer = setTimeout(() => {
      setCurrentBreaking(null);
    }, BREAKING_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [currentBreaking]);

  const dismissCurrent = useCallback(() => {
    setCurrentBreaking(null);
  }, []);

  return {
    currentBreaking,
    breakingQueue,
    dismissCurrent,
  };
}
