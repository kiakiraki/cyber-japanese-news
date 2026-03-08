export type { NewsItem, NewsApiResponse } from './news';
export type {
  PrefectureIntensity,
  EarthquakeItem,
  TsunamiArea,
  TsunamiItem,
  ActiveWarning,
  WarningAreaSummary,
  JmaApiResponse,
} from './jma';

export { BREAKING_KEYWORDS, CATEGORY_KEYWORDS } from './keywords';
export {
  type WarningDefinition,
  getWarningDef,
  severityRank,
  SEVERITY_COLORS,
} from './warning-codes';
