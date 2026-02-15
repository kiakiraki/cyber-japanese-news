export type EffectLevel = 'incoming' | 'alert' | 'critical';

export interface UpdateEvent {
  id: string;
  level: EffectLevel;
  timestamp: number;
  source: 'news' | 'earthquake' | 'tsunami' | 'warning';
  prefectureCodes: string[];
  headline?: string;
  magnitude?: number;
  maxScale?: number;
  newArticleCount?: number;
}
