import { describe, it, expect } from 'vitest';
import { selectFetchCandidates } from './ogp-fetcher';
import type { NewsItem } from './types';

let seq = 0;

function makeItem(overrides: Partial<NewsItem> = {}): NewsItem {
  seq++;
  return {
    id: `id-${seq}`,
    title: `テスト記事${seq}`,
    link: `https://www3.nhk.or.jp/news/html/${seq}.html`,
    source: 'nhk',
    publishedAt: new Date(Date.UTC(2026, 0, 1, 0, seq)).toISOString(),
    prefectureCode: '13',
    prefectureName: '東京都',
    isBreaking: false,
    category: 'other',
    ...overrides,
  };
}

describe('selectFetchCandidates', () => {
  it('national と Google News リンクの記事を除外する', () => {
    const items = [
      makeItem({ prefectureCode: 'national', prefectureName: '全国' }),
      makeItem({ link: 'https://news.google.com/rss/articles/xxx' }),
      makeItem({ prefectureCode: '27', prefectureName: '大阪府' }),
    ];
    const result = selectFetchCandidates(items);
    expect(result).toHaveLength(1);
    expect(result[0].prefectureCode).toBe('27');
  });

  it('同一都道府県は最初の1件だけ残す', () => {
    const items = [
      makeItem({ prefectureCode: '13', title: '東京1件目' }),
      makeItem({ prefectureCode: '13', title: '東京2件目' }),
      makeItem({ prefectureCode: '01', prefectureName: '北海道' }),
    ];
    const result = selectFetchCandidates(items);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.title)).toContain('東京1件目');
    expect(result.map((i) => i.title)).not.toContain('東京2件目');
  });

  it('breaking を先頭に、それ以外は新しい順に並べる', () => {
    const items = [
      makeItem({ prefectureCode: '01', publishedAt: '2026-01-01T03:00:00Z' }),
      makeItem({ prefectureCode: '13', publishedAt: '2026-01-01T01:00:00Z', isBreaking: true }),
      makeItem({ prefectureCode: '27', publishedAt: '2026-01-01T05:00:00Z' }),
    ];
    const result = selectFetchCandidates(items);
    expect(result.map((i) => i.prefectureCode)).toEqual(['13', '27', '01']);
  });

  it('最大15件に制限する', () => {
    const items = Array.from({ length: 30 }, (_, i) =>
      makeItem({ prefectureCode: String(i + 1).padStart(2, '0') }),
    );
    expect(selectFetchCandidates(items)).toHaveLength(15);
  });
});
