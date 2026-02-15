export interface WarningDefinition {
  name: string;
  severity: 'special' | 'warning' | 'advisory';
  color: string;
}

/**
 * 気象庁 bosai API 警報コードテーブル
 * ref: https://doc01.pf.iij-engineering.co.jp/pub/sdkdoc/v1/ja_JP/restapi/rest_jmaweather_ver1.html
 */
const WARNING_TABLE: Record<string, WarningDefinition> = {
  // 特別警報 (Special Warnings)
  '32': { name: '暴風雪特別警報', severity: 'special', color: '#8b00ff' },
  '33': { name: '大雨特別警報', severity: 'special', color: '#8b00ff' },
  '35': { name: '暴風特別警報', severity: 'special', color: '#8b00ff' },
  '36': { name: '大雪特別警報', severity: 'special', color: '#8b00ff' },
  '37': { name: '波浪特別警報', severity: 'special', color: '#8b00ff' },
  '38': { name: '高潮特別警報', severity: 'special', color: '#8b00ff' },

  // 警報 (Warnings)
  '02': { name: '暴風雪警報', severity: 'warning', color: '#ff2800' },
  '03': { name: '大雨警報', severity: 'warning', color: '#ff2800' },
  '04': { name: '洪水警報', severity: 'warning', color: '#ff2800' },
  '05': { name: '暴風警報', severity: 'warning', color: '#ff2800' },
  '06': { name: '大雪警報', severity: 'warning', color: '#ff2800' },
  '07': { name: '波浪警報', severity: 'warning', color: '#ff2800' },
  '08': { name: '高潮警報', severity: 'warning', color: '#ff2800' },

  // 注意報 (Advisories)
  '10': { name: '大雨注意報', severity: 'advisory', color: '#ffcc00' },
  '12': { name: '大雪注意報', severity: 'advisory', color: '#ffcc00' },
  '13': { name: '風雪注意報', severity: 'advisory', color: '#ffcc00' },
  '14': { name: '雷注意報', severity: 'advisory', color: '#ffcc00' },
  '15': { name: '強風注意報', severity: 'advisory', color: '#ffcc00' },
  '16': { name: '波浪注意報', severity: 'advisory', color: '#ffcc00' },
  '17': { name: '融雪注意報', severity: 'advisory', color: '#ffcc00' },
  '18': { name: '洪水注意報', severity: 'advisory', color: '#ffcc00' },
  '19': { name: '高潮注意報', severity: 'advisory', color: '#ffcc00' },
  '20': { name: '濃霧注意報', severity: 'advisory', color: '#ffcc00' },
  '21': { name: '乾燥注意報', severity: 'advisory', color: '#ffcc00' },
  '22': { name: 'なだれ注意報', severity: 'advisory', color: '#ffcc00' },
  '23': { name: '低温注意報', severity: 'advisory', color: '#ffcc00' },
  '24': { name: '霜注意報', severity: 'advisory', color: '#ffcc00' },
  '25': { name: '着氷注意報', severity: 'advisory', color: '#ffcc00' },
  '26': { name: '着雪注意報', severity: 'advisory', color: '#ffcc00' },
  '27': { name: 'その他の注意報', severity: 'advisory', color: '#ffcc00' },
};

export function getWarningDef(code: string): WarningDefinition {
  return (
    WARNING_TABLE[code] ?? {
      name: `気象情報(code:${code})`,
      severity: 'advisory' as const,
      color: '#ffcc00',
    }
  );
}

const SEVERITY_RANKS: Record<string, number> = {
  special: 3,
  warning: 2,
  advisory: 1,
  none: 0,
};

export function severityRank(s: string): number {
  return SEVERITY_RANKS[s] ?? 0;
}

export const SEVERITY_COLORS = {
  special: '#8b00ff',
  warning: '#ff2800',
  advisory: '#ffcc00',
  none: '#444455',
} as const;
