import type { NewsItem } from '../types/news';
import type { EarthquakeItem, WarningAreaSummary } from '../types/jma';
import { GlitchText } from './GlitchText';
import { QuakeInfoCard } from './QuakeInfoCard';
import { WarningPanel } from './WarningPanel';
import { PREFECTURE_MAP } from '../lib/prefectures';

interface NewsSidePanelProps {
  selectedPrefecture: string | null;
  news: NewsItem[];
  newsByPrefecture: Map<string, NewsItem[]>;
  earthquakes?: EarthquakeItem[];
  warnings?: WarningAreaSummary[];
}

const CATEGORY_COLORS: Record<string, string> = {
  disaster: '#ff3030',
  crime: '#ff00ff',
  politics: '#ff8800',
  sports: '#00ff88',
  other: '#00ffff',
};

const CATEGORY_LABELS: Record<string, string> = {
  disaster: '災害',
  crime: '事件',
  politics: '政治',
  sports: 'スポーツ',
  other: 'その他',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function NewsCard({ item }: { item: NewsItem }) {
  const accentColor = CATEGORY_COLORS[item.category] ?? '#00ffff';

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'rgba(18, 18, 26, 0.6)',
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: item.isBreaking
          ? '0 0 15px rgba(255, 48, 48, 0.2), inset 0 0 15px rgba(255, 48, 48, 0.05)'
          : 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold"
          style={{
            color: accentColor,
            border: `1px solid ${accentColor}40`,
            backgroundColor: `${accentColor}10`,
          }}
        >
          {CATEGORY_LABELS[item.category]}
        </span>
        {item.isBreaking && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold animate-pulse"
            style={{
              color: '#ff3030',
              border: '1px solid rgba(255, 48, 48, 0.4)',
              backgroundColor: 'rgba(255, 48, 48, 0.1)',
            }}
          >
            BREAKING
          </span>
        )}
      </div>

      <h3
        className="text-sm leading-snug mb-2 font-sans"
        style={{
          color: '#e0e0e0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.title}
      </h3>

      <div className="flex items-center justify-between text-[10px]" style={{ color: '#888899' }}>
        <span className="uppercase">{item.source}</span>
        <span>{timeAgo(item.publishedAt)}</span>
      </div>
    </a>
  );
}

export function NewsSidePanel({ selectedPrefecture, news, newsByPrefecture, earthquakes = [], warnings = [] }: NewsSidePanelProps) {
  const displayNews = selectedPrefecture
    ? newsByPrefecture.get(selectedPrefecture) ?? []
    : news;

  const prefName = selectedPrefecture
    ? PREFECTURE_MAP.get(selectedPrefecture)?.name ?? '不明'
    : '全国';

  const displayQuakes = earthquakes.slice(0, 5);

  return (
    <aside
      className="w-[380px] h-full flex flex-col shrink-0"
      style={{
        background: 'rgba(18, 18, 26, 0.85)',
        backdropFilter: 'blur(10px)',
        borderLeft: '1px solid rgba(0, 255, 255, 0.15)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
      >
        <div className="flex items-center justify-between">
          <GlitchText
            text={prefName}
            intensity="low"
            className="text-lg font-bold"
            as="h2"
          />
          <span className="text-xs" style={{ color: '#888899' }}>
            {displayNews.length} articles
          </span>
        </div>
      </div>

      {/* Weather Alerts Section */}
      <WarningPanel warnings={warnings} expanded={selectedPrefecture !== null} selectedPrefecture={selectedPrefecture} />

      {/* Seismic Activity Section */}
      <div
        className="px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
      >
        <div className="text-[10px] tracking-[0.2em] mb-2" style={{ color: '#ff922b' }}>
          SEISMIC ACTIVITY
        </div>
        {displayQuakes.length === 0 ? (
          <div className="text-[10px] tracking-wider py-1" style={{ color: '#444455' }}>
            NO RECENT ACTIVITY
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayQuakes.map((eq) => (
              <QuakeInfoCard key={eq.id} earthquake={eq} />
            ))}
          </div>
        )}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayNews.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#888899' }}>
            <div className="text-2xl mb-2">///</div>
            <div className="text-xs tracking-wider">NO DATA AVAILABLE</div>
          </div>
        ) : (
          displayNews.map((item) => <NewsCard key={item.id} item={item} />)
        )}
      </div>
    </aside>
  );
}
