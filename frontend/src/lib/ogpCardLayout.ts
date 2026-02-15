import type { GeoProjection } from 'd3';
import type { NewsItem } from '../types/news';
import { PREFECTURE_MAP } from './prefectures';

export interface OgpCardPlacement {
  newsItem: NewsItem;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
}

const CARD_W = 150;
const CARD_H = 95;
const MARGIN = 5;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x - MARGIN < b.x + b.w + MARGIN &&
    a.x + a.w + MARGIN > b.x - MARGIN &&
    a.y - MARGIN < b.y + b.h + MARGIN &&
    a.y + a.h + MARGIN > b.y - MARGIN
  );
}

// Offset directions: right-up, right-down, left-up, left-down
const OFFSETS: [number, number][] = [
  [15, -50],
  [15, 30],
  [-CARD_W - 15, -50],
  [-CARD_W - 15, 30],
];

export function computeOgpCardPlacements(
  news: NewsItem[],
  projection: GeoProjection,
  maxCards = 5,
): OgpCardPlacement[] {
  // Filter: must have ogpImageUrl, not national, one per prefecture
  const candidates = news.filter(
    (item) => item.ogpImageUrl && item.prefectureCode !== 'national',
  );

  // Deduplicate by prefecture (keep latest per prefecture — already sorted by publishedAt desc)
  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of candidates) {
    if (!seen.has(item.prefectureCode)) {
      seen.add(item.prefectureCode);
      unique.push(item);
    }
  }

  // Sort: breaking first, then by publishedAt desc
  unique.sort((a, b) => {
    if (a.isBreaking !== b.isBreaking) return a.isBreaking ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const placed: Rect[] = [];
  const placements: OgpCardPlacement[] = [];

  for (const item of unique) {
    if (placements.length >= maxCards) break;

    const pref = PREFECTURE_MAP.get(item.prefectureCode);
    if (!pref) continue;

    const coords = projection([pref.lng, pref.lat]);
    if (!coords) continue;

    const [anchorX, anchorY] = coords;

    for (const [dx, dy] of OFFSETS) {
      const rect: Rect = { x: anchorX + dx, y: anchorY + dy, w: CARD_W, h: CARD_H };
      const overlaps = placed.some((existing) => rectsOverlap(rect, existing));

      if (!overlaps) {
        placed.push(rect);
        placements.push({
          newsItem: item,
          x: rect.x,
          y: rect.y,
          anchorX,
          anchorY,
        });
        break;
      }
    }
  }

  return placements;
}
