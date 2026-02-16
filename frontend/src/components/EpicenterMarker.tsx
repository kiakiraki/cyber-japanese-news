import { useState } from 'react';
import type { EarthquakeItem } from '../types/jma';
import { getScaleInfo, getEpicenterColor, getEpicenterDotSize } from '../lib/seismicScale';

interface EpicenterMarkerProps {
  earthquake: EarthquakeItem;
  x: number;
  y: number;
  inverseScale?: number;
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

export function EpicenterMarker({ earthquake, x, y, inverseScale = 1 }: EpicenterMarkerProps) {
  const [hovered, setHovered] = useState(false);

  const mag = earthquake.hypocenter.magnitude;
  const color = getEpicenterColor(mag);
  const baseDotSize = getEpicenterDotSize(mag);
  const dotSize = baseDotSize * inverseScale;
  const scaleInfo = getScaleInfo(earthquake.maxScale);

  const [now] = useState(() => Date.now());
  const elapsedHours = (now - new Date(earthquake.time).getTime()) / (60 * 60 * 1000);
  const isOld = elapsedHours > 6;
  const baseOpacity = isOld ? 0.3 : 0.9;

  const tooltipWidth = 280 * inverseScale;
  const tooltipHeight = 36 * inverseScale;
  const tooltipOffsetX = 12 * inverseScale;
  const tooltipOffsetY = 40 * inverseScale;
  const tooltipFontSize = 11 * inverseScale;
  const tooltipTextOffsetX = 18 * inverseScale;
  const tooltipTextOffsetY = 18 * inverseScale;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Ripple rings (active earthquakes only) */}
      {!isOld &&
        [0, 1, 2].map((i) => (
          <circle
            key={`ripple-${i}`}
            cx={x}
            cy={y}
            r={dotSize}
            fill="none"
            stroke={color}
            strokeWidth={1 * inverseScale}
            opacity={0}
          >
            <animate
              attributeName="r"
              values={`${dotSize};${dotSize + 25 * inverseScale}`}
              dur="2s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0"
              dur="2s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

      {/* Core dot */}
      <circle
        cx={x}
        cy={y}
        r={dotSize}
        fill={color}
        opacity={baseOpacity}
      />

      {/* Tooltip */}
      {hovered && (
        <g>
          <rect
            x={x + tooltipOffsetX}
            y={y - tooltipOffsetY}
            width={tooltipWidth}
            height={tooltipHeight}
            rx={4 * inverseScale}
            fill="rgba(10, 10, 15, 0.95)"
            stroke={color}
            strokeWidth={0.5 * inverseScale}
          />
          <text
            x={x + tooltipTextOffsetX}
            y={y - tooltipTextOffsetY}
            fill="#e0e0e0"
            fontSize={tooltipFontSize}
            fontFamily="JetBrains Mono, monospace"
          >
            {earthquake.hypocenter.name} M{mag} 深さ{earthquake.hypocenter.depth}km / 最大{scaleInfo.label} | {timeAgo(earthquake.time)}
          </text>
        </g>
      )}
    </g>
  );
}
