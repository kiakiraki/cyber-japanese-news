import { describe, it, expect } from 'vitest';
import { cleanGoogleNewsTitle, extractSourceFromItem } from './rss-fetcher';

describe('cleanGoogleNewsTitle', () => {
  it('末尾の「 - ソース名」を除去する', () => {
    expect(cleanGoogleNewsTitle('大谷翔平が今季初ホームラン - Yahoo!ニュース'))
      .toBe('大谷翔平が今季初ホームラン');
  });

  it('複数のハイフンがある場合、最後のサフィックスのみ除去する', () => {
    expect(cleanGoogleNewsTitle('東京-大阪間で新幹線が運休 - NHKニュース'))
      .toBe('東京-大阪間で新幹線が運休');
  });

  it('サフィックスがないタイトルはそのまま返す', () => {
    expect(cleanGoogleNewsTitle('速報ニュース'))
      .toBe('速報ニュース');
  });

  it('空文字列はそのまま返す', () => {
    expect(cleanGoogleNewsTitle('')).toBe('');
  });
});

describe('extractSourceFromItem', () => {
  it('google-news フィードで source 要素（オブジェクト形式）があればそのテキストを返す', () => {
    const item = {
      title: 'テスト記事',
      source: { '#text': 'Yahoo!ニュース', '@_url': 'https://news.yahoo.co.jp' },
    };
    expect(extractSourceFromItem(item, 'google-news')).toBe('Yahoo!ニュース');
  });

  it('google-news フィードで source 要素（文字列形式）があればそのまま返す', () => {
    const item = {
      title: 'テスト記事',
      source: '朝日新聞デジタル',
    };
    expect(extractSourceFromItem(item, 'google-news')).toBe('朝日新聞デジタル');
  });

  it('google-news フィードで source 要素がなければフォールバックする', () => {
    const item = { title: 'テスト記事' };
    expect(extractSourceFromItem(item, 'google-news')).toBe('google-news');
  });

  it('nhk フィードでは feed.source をそのまま返す', () => {
    const item = { title: 'テスト記事' };
    expect(extractSourceFromItem(item, 'nhk')).toBe('nhk');
  });

  it('jiji フィードでは feed.source をそのまま返す', () => {
    const item = { title: 'テスト記事' };
    expect(extractSourceFromItem(item, 'jiji')).toBe('jiji');
  });
});
