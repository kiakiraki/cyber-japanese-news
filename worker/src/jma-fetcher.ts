import type {
  EarthquakeItem,
  TsunamiItem,
  PrefectureIntensity,
} from './types';

const P2P_BASE = 'https://api.p2pquake.net/v2/history';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// --- P2P API raw types ---

interface P2PPoint {
  pref: string;
  addr: string;
  isArea: boolean;
  scale: number;
}

interface P2PEarthquakeEntry {
  id: string;
  code: number;
  time: string;
  issue: { source: string; time: string; type: string };
  earthquake: {
    time: string;
    hypocenter: {
      name: string;
      latitude: number;
      longitude: number;
      depth: number;
      magnitude: number;
    };
    maxScale: number;
    domesticTsunami: string;
  };
  points?: P2PPoint[];
}

interface P2PTsunamiEntry {
  id: string;
  code: number;
  time: string;
  issue: { source: string; time: string; type: string };
  cancelled: boolean;
  areas: { name: string; grade: string; immediate: boolean }[];
}

// --- Helpers ---

function isWithin24Hours(timeStr: string): boolean {
  const t = new Date(timeStr).getTime();
  return Date.now() - t < TWENTY_FOUR_HOURS;
}

function aggregatePrefIntensities(points: P2PPoint[]): PrefectureIntensity[] {
  const map = new Map<string, number>();
  for (const p of points) {
    const current = map.get(p.pref) ?? 0;
    if (p.scale > current) {
      map.set(p.pref, p.scale);
    }
  }
  return Array.from(map, ([pref, maxScale]) => ({ pref, maxScale }));
}

// --- Fetchers ---

async function fetchEarthquakes(): Promise<EarthquakeItem[]> {
  const res = await fetch(`${P2P_BASE}?codes=551&limit=15`);
  if (!res.ok) throw new Error(`P2P earthquake API: ${res.status}`);
  const raw: P2PEarthquakeEntry[] = await res.json();

  return raw
    .filter((e) => isWithin24Hours(e.earthquake?.time ?? e.time))
    .filter((e) => e.earthquake?.hypocenter?.name)
    .map((e) => ({
      id: e.id,
      type: 'earthquake' as const,
      time: e.earthquake.time,
      hypocenter: {
        name: e.earthquake.hypocenter.name,
        latitude: e.earthquake.hypocenter.latitude,
        longitude: e.earthquake.hypocenter.longitude,
        depth: e.earthquake.hypocenter.depth,
        magnitude: e.earthquake.hypocenter.magnitude,
      },
      maxScale: e.earthquake.maxScale,
      domesticTsunami: e.earthquake.domesticTsunami,
      prefectureIntensities: aggregatePrefIntensities(e.points ?? []),
      isBreaking: e.earthquake.maxScale >= 40,
    }));
}

async function fetchTsunamis(): Promise<TsunamiItem[]> {
  const res = await fetch(`${P2P_BASE}?codes=552&limit=5`);
  if (!res.ok) throw new Error(`P2P tsunami API: ${res.status}`);
  const raw: P2PTsunamiEntry[] = await res.json();

  return raw
    .filter((t) => isWithin24Hours(t.time))
    .map((t) => ({
      id: t.id,
      type: 'tsunami' as const,
      time: t.time,
      cancelled: t.cancelled,
      areas: t.areas.map((a) => ({
        name: a.name,
        grade: a.grade,
        immediate: a.immediate,
      })),
      isBreaking: !t.cancelled,
    }));
}

// --- Public API ---

export async function fetchJmaData(): Promise<{
  earthquakes: EarthquakeItem[];
  tsunamis: TsunamiItem[];
}> {
  const [earthquakes, tsunamis] = await Promise.all([
    fetchEarthquakes(),
    fetchTsunamis(),
  ]);

  return { earthquakes, tsunamis };
}
