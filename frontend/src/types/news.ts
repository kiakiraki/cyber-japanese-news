export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  prefectureCode: string;
  prefectureName: string;
  isBreaking: boolean;
  category: 'disaster' | 'crime' | 'politics' | 'sports' | 'other';
}

export interface NewsApiResponse {
  news: NewsItem[];
  fetchedAt: string;
}
