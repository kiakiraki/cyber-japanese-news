import type { EarthquakeItem } from '../types/jma';
import { getScaleInfo } from '../lib/seismicScale';

interface QuakeInfoCardProps {
  earthquake: EarthquakeItem;
}

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

export function QuakeInfoCard({ earthquake }: QuakeInfoCardProps) {
  const scaleInfo = getScaleInfo(earthquake.maxScale);
  const isStrong = earthquake.maxScale >= 40;

  const prefNames = earthquake.prefectureIntensities
    .slice(0, 5)
    .map((p) => p.pref)
    .join('、');

  const tsunamiLabel =
    earthquake.domesticTsunami === 'None' || !earthquake.domesticTsunami
      ? '津波の心配なし'
      : earthquake.domesticTsunami;

  return (
    <div
      className="p-3 rounded transition-all duration-200"
      style={{
        background: 'rgba(18, 18, 26, 0.6)',
        borderLeft: `3px solid ${scaleInfo.color}`,
        boxShadow: isStrong
          ? `0 0 15px ${scaleInfo.glowColor}, inset 0 0 15px ${scaleInfo.glowColor}`
          : 'none',
      }}
    >
      {/* Scale badge + Hypocenter */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider"
          style={{
            color: scaleInfo.color,
            border: `1px solid ${scaleInfo.color}40`,
            backgroundColor: `${scaleInfo.color}10`,
          }}
        >
          {scaleInfo.label}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded tracking-wider"
          style={{ color: '#888899' }}
        >
          M{earthquake.hypocenter.magnitude}
        </span>
      </div>

      {/* Hypocenter name */}
      <h3
        className="text-sm leading-snug mb-1 font-sans"
        style={{ color: '#e0e0e0' }}
      >
        {earthquake.hypocenter.name}
      </h3>

      {/* Details */}
      <div className="text-[10px] space-y-0.5" style={{ color: '#888899' }}>
        <div>深さ {earthquake.hypocenter.depth}km</div>
        {prefNames && <div>観測: {prefNames}</div>}
        <div>{tsunamiLabel}</div>
      </div>

      {/* Time */}
      <div className="mt-1.5 text-[10px] text-right" style={{ color: '#666677' }}>
        {timeAgo(earthquake.time)}
      </div>
    </div>
  );
}
