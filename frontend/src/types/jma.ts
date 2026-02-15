export interface PrefectureIntensity {
  pref: string;
  maxScale: number;
}

export interface EarthquakeItem {
  id: string;
  type: 'earthquake';
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
  prefectureIntensities: PrefectureIntensity[];
  isBreaking: boolean;
}

export interface TsunamiArea {
  name: string;
  grade: string;
  immediate: boolean;
}

export interface TsunamiItem {
  id: string;
  type: 'tsunami';
  time: string;
  cancelled: boolean;
  areas: TsunamiArea[];
  isBreaking: boolean;
}

export interface JmaApiResponse {
  earthquakes: EarthquakeItem[];
  tsunamis: TsunamiItem[];
  meta: {
    lastUpdated: string;
    source: string;
    status: 'ok' | 'error';
  };
}

export type SeismicIntensity = 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70;
