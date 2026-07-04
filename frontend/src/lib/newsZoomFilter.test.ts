import { describe, it, expect } from 'vitest';
import type { GeoProjection } from 'd3';
import { filterVisiblePrefectures } from './newsZoomFilter';
import type { NewsItem } from '../types/news';
import type { ZoomState } from '../hooks/useMapZoom';

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1000;
const ZOOM_DEFAULT: ZoomState = { k: 1, x: 0, y: 0 };

// 全都道府県を画面中央に置く単純な射影
const centerProjection = (() => [500, 500]) as unknown as GeoProjection;
// 全都道府県を画面外に置く射影
const offscreenProjection = (() => [5000, 5000]) as unknown as GeoProjection;

let seq = 0;

function makeItem(overrides: Partial<NewsItem> = {}): NewsItem {
  seq++;
  return {
    id: `id-${seq}`,
    title: `テスト記事${seq}`,
    link: `https://example.com/${seq}`,
    source: 'nhk',
    publishedAt: '2026-07-04T00:00:00Z',
    prefectureCode: '13',
    prefectureName: '東京都',
    isBreaking: false,
    category: 'other',
    ...overrides,
  };
}

function toMap(entries: [string, NewsItem[]][]): Map<string, NewsItem[]> {
  return new Map(entries);
}

describe('filterVisiblePrefectures', () => {
  it('national / international を除外する', () => {
    const map = toMap([
      ['national', [makeItem(), makeItem()]],
      ['international', [makeItem(), makeItem()]],
      ['13', [makeItem(), makeItem()]],
    ]);
    const result = filterVisiblePrefectures(
      map, centerProjection, ZOOM_DEFAULT, 'prefecture', SVG_WIDTH, SVG_HEIGHT,
    );
    expect([...result.keys()]).toEqual(['13']);
  });

  it('ビューポート外の都道府県を除外する', () => {
    const map = toMap([['13', [makeItem(), makeItem()]]]);
    const result = filterVisiblePrefectures(
      map, offscreenProjection, ZOOM_DEFAULT, 'prefecture', SVG_WIDTH, SVG_HEIGHT,
    );
    expect(result.size).toBe(0);
  });

  it('country ティアでは breaking なし・1件のみの都道府県を除外する', () => {
    const map = toMap([
      ['13', [makeItem()]],
      ['27', [makeItem({ prefectureCode: '27' }), makeItem({ prefectureCode: '27' })]],
      ['01', [makeItem({ prefectureCode: '01', isBreaking: true })]],
    ]);
    const result = filterVisiblePrefectures(
      map, centerProjection, ZOOM_DEFAULT, 'country', SVG_WIDTH, SVG_HEIGHT,
    );
    expect([...result.keys()].sort()).toEqual(['01', '27']);
  });

  it('prefecture ティアでは1件のみの都道府県も表示する', () => {
    const map = toMap([['13', [makeItem()]]]);
    const result = filterVisiblePrefectures(
      map, centerProjection, ZOOM_DEFAULT, 'prefecture', SVG_WIDTH, SVG_HEIGHT,
    );
    expect(result.size).toBe(1);
  });

  it('存在しない都道府県コードは無視する', () => {
    const map = toMap([['99', [makeItem({ prefectureCode: '99' })]]]);
    const result = filterVisiblePrefectures(
      map, centerProjection, ZOOM_DEFAULT, 'prefecture', SVG_WIDTH, SVG_HEIGHT,
    );
    expect(result.size).toBe(0);
  });
});
