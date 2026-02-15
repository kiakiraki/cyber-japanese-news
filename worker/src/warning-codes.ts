export interface WarningDefinition {
  name: string;
  severity: 'special' | 'warning' | 'advisory';
}

/**
 * 気象庁 bosai API 警報コードテーブル
 * ref: https://doc01.pf.iij-engineering.co.jp/pub/sdkdoc/v1/ja_JP/restapi/rest_jmaweather_ver1.html
 */
const WARNING_TABLE: Record<string, WarningDefinition> = {
  // 特別警報 (Special Warnings)
  '32': { name: '暴風雪特別警報', severity: 'special' },
  '33': { name: '大雨特別警報', severity: 'special' },
  '35': { name: '暴風特別警報', severity: 'special' },
  '36': { name: '大雪特別警報', severity: 'special' },
  '37': { name: '波浪特別警報', severity: 'special' },
  '38': { name: '高潮特別警報', severity: 'special' },

  // 警報 (Warnings)
  '02': { name: '暴風雪警報', severity: 'warning' },
  '03': { name: '大雨警報', severity: 'warning' },
  '04': { name: '洪水警報', severity: 'warning' },
  '05': { name: '暴風警報', severity: 'warning' },
  '06': { name: '大雪警報', severity: 'warning' },
  '07': { name: '波浪警報', severity: 'warning' },
  '08': { name: '高潮警報', severity: 'warning' },

  // 注意報 (Advisories)
  '10': { name: '大雨注意報', severity: 'advisory' },
  '12': { name: '大雪注意報', severity: 'advisory' },
  '13': { name: '風雪注意報', severity: 'advisory' },
  '14': { name: '雷注意報', severity: 'advisory' },
  '15': { name: '強風注意報', severity: 'advisory' },
  '16': { name: '波浪注意報', severity: 'advisory' },
  '17': { name: '融雪注意報', severity: 'advisory' },
  '18': { name: '洪水注意報', severity: 'advisory' },
  '19': { name: '高潮注意報', severity: 'advisory' },
  '20': { name: '濃霧注意報', severity: 'advisory' },
  '21': { name: '乾燥注意報', severity: 'advisory' },
  '22': { name: 'なだれ注意報', severity: 'advisory' },
  '23': { name: '低温注意報', severity: 'advisory' },
  '24': { name: '霜注意報', severity: 'advisory' },
  '25': { name: '着氷注意報', severity: 'advisory' },
  '26': { name: '着雪注意報', severity: 'advisory' },
  '27': { name: 'その他の注意報', severity: 'advisory' },
};

export function getWarningDef(code: string): WarningDefinition {
  return WARNING_TABLE[code] ?? { name: `気象情報(code:${code})`, severity: 'advisory' };
}
