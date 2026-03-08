import { XMLParser } from 'fast-xml-parser';
import { BREAKING_KEYWORDS, CATEGORY_KEYWORDS } from '@cyber-japanese-news/shared';
import { classifyRegion } from './region-classifier';
import { enrichWithOgp } from './ogp-fetcher';
import type { NewsItem } from './types';

interface FeedConfig {
  url: string;
  source: string;
}

const RSS_FEEDS: FeedConfig[] = [
  { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'nhk' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat1.xml', source: 'nhk' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat3.xml', source: 'nhk' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat4.xml', source: 'nhk' },
  { url: 'https://www3.nhk.or.jp/rss/news/cat5.xml', source: 'nhk' },
  { url: 'https://www.jiji.com/rss/ranking.rdf', source: 'jiji' },
  { url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja', source: 'google-news' },
];

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
  source?: string | { '#text'?: string; '@_url'?: string };
}

function extractText(value: string | { __cdata?: string } | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.__cdata) return value.__cdata;
  return '';
}

export function cleanGoogleNewsTitle(title: string): string {
  return title.replace(/ - [^-]+$/, '');
}

export function extractSourceFromItem(item: RssItem, feedSource: string): string {
  if (feedSource === 'google-news') {
    if (item.source) {
      if (typeof item.source === 'string') return item.source;
      if (item.source['#text']) return item.source['#text'];
    }
    return 'google-news';
  }
  return feedSource;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: '__cdata',
});

const RSS_FETCH_TIMEOUT = 8_000; // 8s
export const RSS_FEED_COUNT = RSS_FEEDS.length;

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const response = await fetch(feed.url, {
        signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      return { parsed: parser.parse(xml), source: feed.source };
    })
  );

  const allNews: NewsItem[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;

    const { parsed, source: feedSource } = result.value;
    const items: RssItem[] = parsed?.rss?.channel?.item ?? parsed?.['rdf:RDF']?.item ?? [];
    const itemList = Array.isArray(items) ? items : [items];

    for (const item of itemList) {
      let title = extractText(item.title);
      const link = typeof item.link === 'string' ? item.link : '';
      if (!title || !link) continue;

      if (feedSource === 'google-news') {
        title = cleanGoogleNewsTitle(title);
      }

      const id = hashString(link);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const publishedAt = item.pubDate ?? item['dc:date'] ?? new Date().toISOString();
      const region = classifyRegion(title);
      const source = extractSourceFromItem(item, feedSource);

      allNews.push({
        id,
        title,
        link,
        source,
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
