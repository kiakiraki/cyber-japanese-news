export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  prefectureCode: string;
  prefectureName: string;
  isBreaking: boolean;
  category: 'disaster' | 'crime' | 'politics' | 'sports' | 'other';
}

export interface NewsApiResponse {
  news: NewsItem[];
  fetchedAt: string;
}

// --- JMA (P2P地震情報) Types ---

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
  status: string; // "発表" | "継続"
}

export interface WarningAreaSummary {
  areaCode: string;        // offices コード "080000" 等
  areaName: string;        // 地域名（複数officesがある場合は代表名）
  prefectureName: string;  // 47都道府県名（北海道は統一）
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
