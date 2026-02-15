import type { EarthquakeItem, TsunamiItem } from '../types/jma';

const now = Date.now();

export const MOCK_EARTHQUAKES: EarthquakeItem[] = [
  {
    id: 'mock-eq-01',
    type: 'earthquake',
    time: new Date(now - 30 * 60 * 1000).toISOString(), // 30分前
    hypocenter: {
      name: '茨城県沖',
      latitude: 36.4,
      longitude: 140.7,
      depth: 40,
      magnitude: 4.2,
    },
    maxScale: 40,
    domesticTsunami: 'None',
    prefectureIntensities: [
      { pref: '茨城県', maxScale: 40 },
      { pref: '栃木県', maxScale: 30 },
      { pref: '千葉県', maxScale: 20 },
      { pref: '埼玉県', maxScale: 20 },
      { pref: '東京都', maxScale: 10 },
    ],
    isBreaking: true,
  },
  {
    id: 'mock-eq-02',
    type: 'earthquake',
    time: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3時間前
    hypocenter: {
      name: '熊本県熊本地方',
      latitude: 32.8,
      longitude: 130.7,
      depth: 10,
      magnitude: 3.1,
    },
    maxScale: 30,
    domesticTsunami: 'None',
    prefectureIntensities: [
      { pref: '熊本県', maxScale: 30 },
      { pref: '大分県', maxScale: 10 },
    ],
    isBreaking: false,
  },
];

export const MOCK_TSUNAMIS: TsunamiItem[] = [];
