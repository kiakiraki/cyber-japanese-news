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

// --- Warning (気象警報) Types ---

export interface ActiveWarning {
  code: string;
  name: string;
  severity: 'special' | 'warning' | 'advisory';
  status: string;
}

export interface WarningAreaSummary {
  areaCode: string;
  areaName: string;
  prefectureName: string;
  maxSeverity: 'special' | 'warning' | 'advisory' | 'none';
  activeWarnings: ActiveWarning[];
  reportDatetime: string;
}

export interface JmaApiResponse {
  earthquakes: EarthquakeItem[];
  tsunamis: TsunamiItem[];
  warnings: WarningAreaSummary[];
  meta: {
    lastUpdated: string;
    sources: {
      p2pquake: 'ok' | 'error';
      jmaWarning: 'ok' | 'error';
    };
  };
}

export type SeismicIntensity = 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70;
