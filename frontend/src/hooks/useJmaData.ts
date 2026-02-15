import { useState, useEffect, useCallback, useMemo } from 'react';
import type { EarthquakeItem, TsunamiItem } from '../types/jma';
import { MOCK_EARTHQUAKES, MOCK_TSUNAMIS } from '../lib/mockJma';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const POLL_INTERVAL = 30_000;
const MAX_RETRIES = 3;
const SIX_HOURS = 6 * 60 * 60 * 1000;

export type JmaStatus = 'fresh' | 'stale' | 'error' | 'loading';

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

function findRecentQuake(earthquakes: EarthquakeItem[]): EarthquakeItem | null {
  const cutoff = Date.now() - SIX_HOURS;
  const recent = earthquakes.filter((eq) => new Date(eq.time).getTime() > cutoff);
  if (recent.length === 0) return null;

  return recent.reduce((strongest, eq) =>
    eq.maxScale > strongest.maxScale ? eq : strongest
  );
}

export function useJmaData() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [tsunamis, setTsunamis] = useState<TsunamiItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [status, setStatus] = useState<JmaStatus>('loading');

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      setEarthquakes(MOCK_EARTHQUAKES);
      setTsunamis(MOCK_TSUNAMIS);
      setLastUpdated(new Date());
      setStatus('fresh');
      return;
    }

    try {
      const data = await fetchWithRetry(`${API_URL}/api/jma`);
      if (data) {
        setEarthquakes(data.earthquakes ?? []);
        setTsunamis(data.tsunamis ?? []);
        setLastUpdated(new Date());
        setStatus(data.meta?.status === 'ok' ? 'fresh' : 'stale');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const recentQuake = useMemo(() => findRecentQuake(earthquakes), [earthquakes]);

  const hasTsunami = useMemo(
    () => tsunamis.some((t) => !t.cancelled),
    [tsunamis]
  );

  return {
    earthquakes,
    tsunamis,
    recentQuake,
    hasTsunami,
    status,
    lastUpdated,
  };
}
