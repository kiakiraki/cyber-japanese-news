import type { GeoProjection } from 'd3';
import type { ZoomState, ZoomTier } from '../hooks/useMapZoom';
import type { NewsItem } from '../types/news';
import { PREFECTURE_MAP } from './prefectures';

interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getViewportBounds(
  zoomState: ZoomState,
  svgWidth: number,
  svgHeight: number,
): ViewportBounds {
  const { k, x, y } = zoomState;
  return {
    minX: -x / k,
    maxX: (svgWidth - x) / k,
    minY: -y / k,
    maxY: (svgHeight - y) / k,
  };
}

function isInViewport(
  px: number,
  py: number,
  bounds: ViewportBounds,
  margin = 30,
): boolean {
  return (
    px >= bounds.minX - margin &&
    px <= bounds.maxX + margin &&
    py >= bounds.minY - margin &&
    py <= bounds.maxY + margin
  );
}

export function filterVisiblePrefectures(
  newsByPrefecture: Map<string, NewsItem[]>,
  projection: GeoProjection,
  zoomState: ZoomState,
  tier: ZoomTier,
  svgWidth: number,
  svgHeight: number,
): Map<string, NewsItem[]> {
  const bounds = getViewportBounds(zoomState, svgWidth, svgHeight);
  const filtered = new Map<string, NewsItem[]>();

  for (const [code, items] of newsByPrefecture) {
    if (code === 'national') continue;

    const pref = PREFECTURE_MAP.get(code);
    if (!pref) continue;

    const coords = projection([pref.lng, pref.lat]);
    if (!coords) continue;

    const [px, py] = coords;

    // Skip prefectures outside viewport
    if (!isInViewport(px, py, bounds)) continue;

    // At country tier, only show prefectures with breaking news or 2+ articles
    if (tier === 'country') {
      const hasBreaking = items.some((item) => item.isBreaking);
      if (!hasBreaking && items.length < 2) continue;
    }

    filtered.set(code, items);
  }

  return filtered;
}
