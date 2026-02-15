import type { WarningAreaSummary } from '../types/jma';

export const MOCK_WARNINGS: WarningAreaSummary[] = [
  {
    areaCode: '080000',
    areaName: '茨城県',
    prefectureName: '茨城県',
    maxSeverity: 'warning',
    activeWarnings: [
      { code: '03', name: '大雨警報', severity: 'warning', status: '発表' },
      { code: '13', name: '雷注意報', severity: 'advisory', status: '継続' },
    ],
    reportDatetime: new Date().toISOString(),
  },
  {
    areaCode: '130000',
    areaName: '東京都',
    prefectureName: '東京都',
    maxSeverity: 'advisory',
    activeWarnings: [
      { code: '12', name: '強風注意報', severity: 'advisory', status: '発表' },
    ],
    reportDatetime: new Date().toISOString(),
  },
  {
    areaCode: '140000',
    areaName: '神奈川県',
    prefectureName: '神奈川県',
    maxSeverity: 'advisory',
    activeWarnings: [
      { code: '19', name: '乾燥注意報', severity: 'advisory', status: '継続' },
    ],
    reportDatetime: new Date().toISOString(),
  },
];
