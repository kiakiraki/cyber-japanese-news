import { useState, useEffect, useRef, useCallback } from 'react';
import type { NewsItem } from '../types/news';
import type { EarthquakeItem, TsunamiItem, WarningAreaSummary } from '../types/jma';
import type { EffectLevel, UpdateEvent } from '../types/effects';
import { getScaleInfo } from '../lib/seismicScale';

const COOLDOWN_MS: Record<EffectLevel, number> = {
  incoming: 10_000,
  alert: 5_000,
  critical: 0,
};

const LEVEL_PRIORITY: Record<EffectLevel, number> = {
  incoming: 0,
  alert: 1,
  critical: 2,
};

const EFFECT_DURATION: Record<EffectLevel, number> = {
  incoming: 1_000,
  alert: 3_000,
  critical: 5_000,
};

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function downgradeLevel(level: EffectLevel): EffectLevel | null {
  if (!getPrefersReducedMotion()) return level;
  if (level === 'incoming') return null;
  if (level === 'alert') return 'incoming';
  return 'alert'; // critical -> alert
}

function determineNewsLevel(newCount: number): EffectLevel {
  if (newCount >= 5) return 'alert';
  return 'incoming';
}

function determineEarthquakeLevel(maxScale: number): EffectLevel {
  if (maxScale >= 50) return 'critical'; // 5+ or higher
  if (maxScale >= 30) return 'alert';    // 3-4
  return 'incoming';
}

function determineTsunamiLevel(areas: TsunamiItem['areas']): EffectLevel {
  const hasImmediate = areas.some((a) => a.immediate);
  if (hasImmediate) return 'critical';
  return 'alert';
}

function determineWarningLevel(maxSeverity: WarningAreaSummary['maxSeverity']): EffectLevel {
  if (maxSeverity === 'special') return 'critical';
  if (maxSeverity === 'warning') return 'alert';
  return 'incoming';
}

export function useUpdateDetection(
  news: NewsItem[],
  earthquakes: EarthquakeItem[],
  tsunamis: TsunamiItem[],
  warnings: WarningAreaSummary[],
) {
  const [activeEvent, setActiveEvent] = useState<UpdateEvent | null>(null);

  const prevNewsIdsRef = useRef<Set<string>>(new Set());
  const prevEarthquakeIdsRef = useRef<Set<string>>(new Set());
  const prevTsunamiIdsRef = useRef<Set<string>>(new Set());
  const prevWarningKeysRef = useRef<Set<string>>(new Set());

  const isInitialLoadRef = useRef(true);
  const lastFireTimeRef = useRef<Record<EffectLevel, number>>({
    incoming: 0,
    alert: 0,
    critical: 0,
  });
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fireEvent = useCallback((event: UpdateEvent) => {
    const now = Date.now();
    const level = downgradeLevel(event.level);
    if (!level) return; // reduced-motion: skip incoming

    const effectiveEvent = { ...event, level };

    // Cooldown check
    const elapsed = now - lastFireTimeRef.current[level];
    if (elapsed < COOLDOWN_MS[level]) return;

    // Priority check: don't interrupt higher-level effects
    if (activeEvent && LEVEL_PRIORITY[activeEvent.level] > LEVEL_PRIORITY[level]) return;

    lastFireTimeRef.current[level] = now;

    // Clear previous timer
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    setActiveEvent(effectiveEvent);

    clearTimerRef.current = setTimeout(() => {
      setActiveEvent(null);
    }, EFFECT_DURATION[level]);
  }, [activeEvent]);

  const clearEvent = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setActiveEvent(null);
  }, []);

  // Detect news changes
  useEffect(() => {
    const currentIds = new Set(news.map((n) => n.id));

    if (isInitialLoadRef.current && news.length > 0) {
      prevNewsIdsRef.current = currentIds;
      return;
    }

    const newIds = [...currentIds].filter((id) => !prevNewsIdsRef.current.has(id));
    if (newIds.length > 0) {
      const level = determineNewsLevel(newIds.length);
      const newArticles = news.filter((n) => newIds.includes(n.id));
      const headline = newArticles[0]?.title;

      fireEvent({
        id: `news-${Date.now()}`,
        level,
        timestamp: Date.now(),
        source: 'news',
        prefectureCodes: [],
        headline: headline ? `${headline}${newIds.length > 1 ? ` 他${newIds.length - 1}件` : ''}` : undefined,
        newArticleCount: newIds.length,
      });
    }

    prevNewsIdsRef.current = currentIds;
  }, [news, fireEvent]);

  // Detect earthquake changes
  useEffect(() => {
    const currentIds = new Set(earthquakes.map((eq) => eq.id));

    if (isInitialLoadRef.current && earthquakes.length > 0) {
      prevEarthquakeIdsRef.current = currentIds;
      return;
    }

    const newIds = [...currentIds].filter((id) => !prevEarthquakeIdsRef.current.has(id));
    if (newIds.length > 0) {
      const newQuakes = earthquakes.filter((eq) => newIds.includes(eq.id));
      const strongest = newQuakes.reduce((a, b) => (b.maxScale > a.maxScale ? b : a), newQuakes[0]);
      const level = determineEarthquakeLevel(strongest.maxScale);
      const scaleLabel = getScaleInfo(strongest.maxScale).label;

      fireEvent({
        id: `eq-${strongest.id}`,
        level,
        timestamp: Date.now(),
        source: 'earthquake',
        prefectureCodes: [],
        headline: `地震速報: ${strongest.hypocenter.name} M${strongest.hypocenter.magnitude} 最大${scaleLabel}`,
        magnitude: strongest.hypocenter.magnitude,
        maxScale: strongest.maxScale,
      });
    }

    prevEarthquakeIdsRef.current = currentIds;
  }, [earthquakes, fireEvent]);

  // Detect tsunami changes
  useEffect(() => {
    const currentIds = new Set(tsunamis.map((t) => t.id));

    if (isInitialLoadRef.current && tsunamis.length > 0) {
      prevTsunamiIdsRef.current = currentIds;
      return;
    }

    const newIds = [...currentIds].filter((id) => !prevTsunamiIdsRef.current.has(id));
    if (newIds.length > 0) {
      const newTsunamis = tsunamis.filter((t) => newIds.includes(t.id));
      const activeTsunami = newTsunamis.find((t) => !t.cancelled) ?? newTsunamis[0];
      const level = activeTsunami.cancelled ? 'incoming' as EffectLevel : determineTsunamiLevel(activeTsunami.areas);
      const areaNames = activeTsunami.areas.slice(0, 3).map((a) => a.name).join('、');

      fireEvent({
        id: `ts-${activeTsunami.id}`,
        level,
        timestamp: Date.now(),
        source: 'tsunami',
        prefectureCodes: [],
        headline: `津波情報: ${areaNames}`,
      });
    }

    prevTsunamiIdsRef.current = currentIds;
  }, [tsunamis, fireEvent]);

  // Detect warning changes
  useEffect(() => {
    const currentKeys = new Set(
      warnings.flatMap((w) =>
        w.activeWarnings.map((aw) => `${w.areaCode}-${aw.code}`)
      )
    );

    if (isInitialLoadRef.current && warnings.length > 0) {
      prevWarningKeysRef.current = currentKeys;
      return;
    }

    const newKeys = [...currentKeys].filter((k) => !prevWarningKeysRef.current.has(k));
    if (newKeys.length > 0) {
      const maxSeverity = warnings.reduce<WarningAreaSummary['maxSeverity']>((max, w) => {
        if (w.maxSeverity === 'special') return 'special';
        if (w.maxSeverity === 'warning' && max !== 'special') return 'warning';
        return max;
      }, 'none');

      const level = determineWarningLevel(maxSeverity);
      const topWarning = warnings.find((w) => w.maxSeverity === maxSeverity);

      fireEvent({
        id: `warn-${Date.now()}`,
        level,
        timestamp: Date.now(),
        source: 'warning',
        prefectureCodes: [],
        headline: topWarning
          ? `${topWarning.prefectureName} ${topWarning.activeWarnings[0]?.name ?? '気象警報'}`
          : '気象警報発表',
      });
    }

    prevWarningKeysRef.current = currentKeys;
  }, [warnings, fireEvent]);

  // Mark initial load as complete after first data arrives
  useEffect(() => {
    if (isInitialLoadRef.current && (news.length > 0 || earthquakes.length > 0)) {
      // Use timeout to ensure all detection effects have run
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [news, earthquakes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return { activeEvent, clearEvent, fireEvent };
}
