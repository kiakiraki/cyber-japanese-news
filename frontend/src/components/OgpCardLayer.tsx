import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeoProjection } from 'd3';
import type { NewsItem } from '../types/news';
import { computeOgpCardPlacements, type OgpCardPlacement } from '../lib/ogpCardLayout';

interface OgpCardLayerProps {
  news: NewsItem[];
  projection: GeoProjection;
  inverseScale?: number;
  maxCards?: number;
}

const CARD_W = 150;
const CARD_H = 95;

function OgpCard({
  placement,
  index,
  inverseScale,
}: {
  placement: OgpCardPlacement;
  index: number;
  inverseScale: number;
}) {
  const { newsItem, x, y, anchorX, anchorY } = placement;
  const isBreaking = newsItem.isBreaking;
  const [imgError, setImgError] = useState(false);

  const handleImgError = useCallback(() => setImgError(true), []);

  if (imgError) return null;

  const borderColor = isBreaking ? 'rgba(255, 48, 48, 0.6)' : 'rgba(0, 255, 255, 0.3)';
  const glowColor = isBreaking ? 'rgba(255, 48, 48, 0.3)' : 'none';
  const lineColor = isBreaking ? 'rgba(255, 48, 48, 0.25)' : 'rgba(0, 255, 255, 0.2)';

  // Connect line from card bottom-left to anchor point
  // Card is inverse-scaled around (x, y), so visual bottom is at y + CARD_H * inverseScale
  const lineX1 = x;
  const lineY1 = y + CARD_H * inverseScale;

  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Connection line */}
      <line
        x1={lineX1}
        y1={lineY1}
        x2={anchorX}
        y2={anchorY}
        stroke={lineColor}
        strokeWidth={1 * inverseScale}
        strokeDasharray={`${3 * inverseScale},${3 * inverseScale}`}
      />

      {/* Card via foreignObject, wrapped in <g> for Safari transform compat */}
      <g transform={`translate(${x}, ${y}) scale(${inverseScale}) translate(${-x}, ${-y})`}>
        <foreignObject x={x} y={y} width={CARD_W} height={CARD_H}>
          <div
            style={{
              width: CARD_W,
              height: CARD_H,
              background: 'rgba(10, 10, 20, 0.85)',
              backdropFilter: 'blur(4px)',
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: isBreaking ? `0 0 12px ${glowColor}` : 'none',
              cursor: 'pointer',
            }}
            onClick={() => window.open(newsItem.link, '_blank', 'noopener')}
          >
            {/* OGP Image */}
            <img
              src={newsItem.ogpImageUrl}
              alt=""
              onError={handleImgError}
              style={{
                width: '100%',
                height: 55,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Title */}
            <div
              style={{
                padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                lineHeight: '13px',
                color: '#e0e0e0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {newsItem.title}
            </div>

            {/* Prefecture label */}
            <div
              style={{
                padding: '0 6px 3px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 7,
                color: isBreaking ? '#ff6060' : '#00cccc',
                opacity: 0.8,
              }}
            >
              {newsItem.prefectureName}
            </div>
          </div>
        </foreignObject>
      </g>
    </motion.g>
  );
}

export function OgpCardLayer({ news, projection, inverseScale = 1, maxCards = 5 }: OgpCardLayerProps) {
  const placements = useMemo(
    () => computeOgpCardPlacements(news, projection, maxCards),
    [news, projection, maxCards],
  );

  return (
    <AnimatePresence>
      {placements.map((placement, i) => (
        <OgpCard
          key={placement.newsItem.id}
          placement={placement}
          index={i}
          inverseScale={inverseScale}
        />
      ))}
    </AnimatePresence>
  );
}
