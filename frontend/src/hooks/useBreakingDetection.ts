import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsItem } from '../types/news';
import type { EarthquakeItem, TsunamiItem, WarningAreaSummary } from '../types/jma';
import { getScaleInfo } from '../lib/seismicScale';

const BREAKING_DISPLAY_DURATION = 20_000;

export interface BreakingItem {
  id: string;
  title: string;
  prefectureName: string;
}

function earthquakeToBreaking(eq: EarthquakeItem): BreakingItem {
  const scaleLabel = getScaleInfo(eq.maxScale).label;
  return {
    id: `eq-${eq.id}`,
    title: `⚠ 地震速報: ${eq.hypocenter.name} M${eq.hypocenter.magnitude} 最大${scaleLabel}`,
    prefectureName: eq.hypocenter.name,
  };
}

function tsunamiToBreaking(t: TsunamiItem): BreakingItem {
  const areaNames = t.areas.slice(0, 3).map((a) => a.name).join('、');
  return {
    id: `ts-${t.id}`,
    title: `🌊 津波情報: ${areaNames}`,
    prefectureName: '全国',
  };
}

function specialWarningToBreaking(w: WarningAreaSummary): BreakingItem[] {
  return w.activeWarnings
    .filter((aw) => aw.severity === 'special')
    .map((aw) => ({
      id: `sw-${w.areaCode}-${aw.code}`,
      title: `⚠ 特別警報: ${w.prefectureName} ${aw.name}`,
      prefectureName: w.prefectureName,
    }));
}

export function useBreakingDetection(
  news: NewsItem[],
  earthquakes: EarthquakeItem[] = [],
  tsunamis: TsunamiItem[] = [],
  warnings: WarningAreaSummary[] = [],
) {
  const [breakingQueue, setBreakingQueue] = useState<BreakingItem[]>([]);
  const shownIdsRef = useRef(new Set<string>());

  const currentBreaking = breakingQueue[0] ?? null;

  // News breaking items
  useEffect(() => {
    const newBreaking = news
      .filter((item) => item.isBreaking && !shownIdsRef.current.has(item.id))
      .map((item): BreakingItem => ({
        id: item.id,
        title: item.title,
        prefectureName: item.prefectureName,
      }));

    if (newBreaking.length > 0) {
      setBreakingQueue((prev) => [...prev, ...newBreaking]);
      for (const item of newBreaking) {
        shownIdsRef.current.add(item.id);
      }
    }
  }, [news]);

  // Earthquake breaking items
  useEffect(() => {
    const newBreaking = earthquakes
      .filter((eq) => eq.isBreaking && !shownIdsRef.current.has(`eq-${eq.id}`))
      .map(earthquakeToBreaking);

    if (newBreaking.length > 0) {
      setBreakingQueue((prev) => [...prev, ...newBreaking]);
      for (const item of newBreaking) {
        shownIdsRef.current.add(item.id);
      }
    }
  }, [earthquakes]);

  // Tsunami breaking items
  useEffect(() => {
    const newBreaking = tsunamis
      .filter((t) => t.isBreaking && !shownIdsRef.current.has(`ts-${t.id}`))
      .map(tsunamiToBreaking);

    if (newBreaking.length > 0) {
      setBreakingQueue((prev) => [...prev, ...newBreaking]);
      for (const item of newBreaking) {
        shownIdsRef.current.add(item.id);
      }
    }
  }, [tsunamis]);

  // Special warning breaking items
  useEffect(() => {
    const newBreaking = warnings
      .filter((w) => w.maxSeverity === 'special')
      .flatMap(specialWarningToBreaking)
      .filter((item) => !shownIdsRef.current.has(item.id));

    if (newBreaking.length > 0) {
      setBreakingQueue((prev) => [...prev, ...newBreaking]);
      for (const item of newBreaking) {
        shownIdsRef.current.add(item.id);
      }
    }
  }, [warnings]);

  // Auto-dismiss timer: pop the first item after display duration
  useEffect(() => {
    if (!currentBreaking) return;

    const timer = setTimeout(() => {
      setBreakingQueue((prev) => prev.slice(1));
    }, BREAKING_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [currentBreaking]);

  const dismissCurrent = useCallback(() => {
    setBreakingQueue((prev) => prev.slice(1));
  }, []);

  return {
    currentBreaking,
    breakingQueue,
    dismissCurrent,
  };
}
