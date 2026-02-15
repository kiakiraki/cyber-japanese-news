import { XMLParser } from 'fast-xml-parser';
import { classifyRegion } from './region-classifier';
import { enrichWithOgp } from './ogp-fetcher';
import type { NewsItem } from './types';

const RSS_FEEDS = [
  'https://www3.nhk.or.jp/rss/news/cat0.xml',
  'https://www3.nhk.or.jp/rss/news/cat1.xml',
  'https://www3.nhk.or.jp/rss/news/cat3.xml',
];

const BREAKING_KEYWORDS = [
  '速報', '緊急', '地震', '津波', '警報', '避難',
  '逮捕', 'テロ', 'ミサイル', '噴火',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  disaster: ['地震', '津波', '台風', '豪雨', '噴火', '洪水', '土砂崩れ', '暴風', '大雪', '警報', '避難'],
  crime: ['逮捕', '容疑', '事件', '殺人', '詐欺', '強盗', '窃盗', '暴行', '裁判', '判決', '起訴'],
  politics: ['政府', '国会', '首相', '大臣', '選挙', '法案', '外交', '条約', '内閣', '知事'],
  sports: ['五輪', 'オリンピック', '大谷', '野球', 'サッカー', '試合', '優勝', '選手権', 'W杯'],
};

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function classifyCategory(title: string): NewsItem['category'] {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return category as NewsItem['category'];
      }
    }
  }
  return 'other';
}

function isBreaking(title: string, publishedAt: string): boolean {
  for (const keyword of BREAKING_KEYWORDS) {
    if (title.includes(keyword)) return true;
  }

  const publishedTime = new Date(publishedAt).getTime();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  return publishedTime > thirtyMinutesAgo;
}

interface RssItem {
  title?: string | { __cdata?: string };
  link?: string;
  pubDate?: string;
  'dc:date'?: string;
}

function extractText(value: string | { __cdata?: string } | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.__cdata) return value.__cdata;
  return '';
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
  });

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      return parser.parse(xml);
    })
  );

  const allNews: NewsItem[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;

    const parsed = result.value;
    const items: RssItem[] = parsed?.rss?.channel?.item ?? parsed?.['rdf:RDF']?.item ?? [];
    const itemList = Array.isArray(items) ? items : [items];

    for (const item of itemList) {
      const title = extractText(item.title);
      const link = typeof item.link === 'string' ? item.link : '';
      if (!title || !link) continue;

      const id = hashString(link);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const publishedAt = item.pubDate ?? item['dc:date'] ?? new Date().toISOString();
      const region = classifyRegion(title);

      allNews.push({
        id,
        title,
        link,
        source: 'nhk',
        publishedAt: new Date(publishedAt).toISOString(),
        prefectureCode: region.prefectureCode,
        prefectureName: region.prefectureName,
        isBreaking: isBreaking(title, publishedAt),
        category: classifyCategory(title),
      });
    }
  }

  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return enrichWithOgp(allNews);
}
