import { useState, useEffect, useCallback, useMemo } from 'react';
import type { EarthquakeItem, TsunamiItem, WarningAreaSummary } from '../types/jma';
import { MOCK_EARTHQUAKES, MOCK_TSUNAMIS } from '../lib/mockJma';
import { MOCK_WARNINGS } from '../lib/mockWarnings';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const POLL_INTERVAL = 30_000;
const MAX_RETRIES = 3;
const THREE_HOURS = 3 * 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;

export type JmaStatus = 'fresh' | 'stale' | 'error' | 'loading';

export interface JmaSourceStatus {
  p2pquake: JmaStatus;
  jmaWarning: JmaStatus;
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  return null;
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

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      setEarthquakes(MOCK_EARTHQUAKES);
      setTsunamis(MOCK_TSUNAMIS);
      setWarnings(MOCK_WARNINGS);
      setLastUpdated(new Date());
      setStatus({ p2pquake: 'fresh', jmaWarning: 'fresh' });
      return;
    }

    try {
      const data = await fetchWithRetry(`${API_URL}/api/jma`);
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
      setStatus({ p2pquake: 'error', jmaWarning: 'error' });
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(fetchData, 0);
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [fetchData]);

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
