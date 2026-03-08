import { useState, useEffect, useRef, useMemo } from 'react';
import type { EarthquakeItem, TsunamiItem, WarningAreaSummary, JmaApiResponse } from '../types/jma';
import { fetchWithRetry } from '../lib/fetchUtils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const POLL_INTERVAL = 30_000;
const THREE_HOURS = 3 * 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;

export type JmaStatus = 'fresh' | 'stale' | 'error' | 'loading';

export interface JmaSourceStatus {
  p2pquake: JmaStatus;
  jmaWarning: JmaStatus;
}

function filterRecentQuakes(earthquakes: EarthquakeItem[]): EarthquakeItem[] {
  const now = Date.now();
  return earthquakes.filter((eq) => {
    const elapsed = now - new Date(eq.time).getTime();
    // maxScale <= 30 (震度3以下): 3時間以内, それ以上: 6時間以内
    const cutoff = eq.maxScale <= 30 ? THREE_HOURS : SIX_HOURS;
    return elapsed < cutoff;
  });
}

function findRecentQuake(earthquakes: EarthquakeItem[]): EarthquakeItem | null {
  const recent = filterRecentQuakes(earthquakes);
  if (recent.length === 0) return null;

  return recent.reduce((strongest, eq) =>
    eq.maxScale > strongest.maxScale ? eq : strongest
  );
}

export function useJmaData() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [tsunamis, setTsunamis] = useState<TsunamiItem[]>([]);
  const [warnings, setWarnings] = useState<WarningAreaSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [status, setStatus] = useState<JmaSourceStatus>({
    p2pquake: 'loading',
    jmaWarning: 'loading',
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (USE_MOCK) {
        const [{ MOCK_EARTHQUAKES, MOCK_TSUNAMIS }, { MOCK_WARNINGS }] = await Promise.all([
          import('../lib/mockJma'),
          import('../lib/mockWarnings'),
        ]);
        setEarthquakes(MOCK_EARTHQUAKES);
        setTsunamis(MOCK_TSUNAMIS);
        setWarnings(MOCK_WARNINGS);
        setLastUpdated(new Date());
        setStatus({ p2pquake: 'fresh', jmaWarning: 'fresh' });
        return;
      }

      // Abort previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await fetchWithRetry<JmaApiResponse>(`${API_URL}/api/jma`, {
          signal: controller.signal,
        });
        if (data) {
          setEarthquakes(data.earthquakes ?? []);
          setTsunamis(data.tsunamis ?? []);
          setWarnings(data.warnings ?? []);
          setLastUpdated(new Date());

          const sources = data.meta?.sources;
          if (sources) {
            setStatus({
              p2pquake: sources.p2pquake === 'ok' ? 'fresh' : 'stale',
              jmaWarning: sources.jmaWarning === 'ok' ? 'fresh' : 'stale',
            });
          } else {
            setStatus({ p2pquake: 'stale', jmaWarning: 'stale' });
          }
        }
      } catch {
        if (controller.signal.aborted) return;
        setStatus({ p2pquake: 'error', jmaWarning: 'error' });
      }
    }

    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  const displayQuakes = useMemo(() => filterRecentQuakes(earthquakes), [earthquakes]);
  const recentQuake = useMemo(() => findRecentQuake(earthquakes), [earthquakes]);

  const hasTsunami = useMemo(
    () => tsunamis.some((t) => !t.cancelled),
    [tsunamis]
  );

  const hasWarning = useMemo(
    () => warnings.some((w) => w.maxSeverity === 'warning' || w.maxSeverity === 'special'),
    [warnings]
  );

  const hasSpecialWarning = useMemo(
    () => warnings.some((w) => w.maxSeverity === 'special'),
    [warnings]
  );

  return {
    earthquakes,
    displayQuakes,
    tsunamis,
    warnings,
    recentQuake,
    hasTsunami,
    hasWarning,
    hasSpecialWarning,
    status,
    lastUpdated,
  };
}
