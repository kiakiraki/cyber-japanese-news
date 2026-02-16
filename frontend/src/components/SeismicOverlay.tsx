import { useState } from 'react';
import type { EarthquakeItem } from '../types/jma';
import { getScaleInfo } from '../lib/seismicScale';

interface SeismicOverlayProps {
  recentQuake: EarthquakeItem | null;
  prefecturePaths: Map<string, string>; // prefName -> SVG path 'd' attribute
}

export function SeismicOverlay({ recentQuake, prefecturePaths }: SeismicOverlayProps) {
  const [now] = useState(() => Date.now());

  if (!recentQuake) return null;

  const elapsedHours =
    (now - new Date(recentQuake.time).getTime()) / (60 * 60 * 1000);
  const timeFade = Math.max(0, 0.5 * (1 - elapsedHours / 6));

  if (timeFade <= 0) return null;

  return (
    <g className="seismic-overlay">
      {recentQuake.prefectureIntensities.map((pi) => {
        const pathD = prefecturePaths.get(pi.pref);
        if (!pathD) return null;

        const info = getScaleInfo(pi.maxScale);
        const opacity = (0.25 + info.severity * 0.25) * (timeFade / 0.5);

        return (
          <path
            key={pi.pref}
            d={pathD}
            fill={info.color}
            opacity={opacity}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </g>
  );
}
