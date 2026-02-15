import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JmaStatus, JmaSourceStatus } from '../hooks/useJmaData';
import type { UpdateEvent } from '../types/effects';

interface StatsBarProps {
  totalCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  jmaStatus?: JmaSourceStatus;
  flashEvent?: UpdateEvent | null;
}

function formatJST(date: Date): string {
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

const JMA_STATUS_COLORS: Record<JmaStatus, string> = {
  fresh: '#00ff88',
  stale: '#ff8800',
  error: '#ff3030',
  loading: '#ff8800',
};

export function StatsBar({
  totalCount,
  lastUpdated,
  isLoading,
  jmaStatus = { p2pquake: 'loading', jmaWarning: 'loading' },
  flashEvent = null,
}: StatsBarProps) {
  const isAlertOrCritical = flashEvent && (flashEvent.level === 'alert' || flashEvent.level === 'critical');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 h-[48px] shrink-0 text-xs tracking-wider"
      style={{
        background: 'linear-gradient(180deg, rgba(18, 18, 26, 0.95) 0%, rgba(10, 10, 15, 0.9) 100%)',
        borderBottom: `1px solid ${isAlertOrCritical ? 'rgba(255, 48, 48, 0.6)' : 'rgba(0, 255, 255, 0.3)'}`,
        boxShadow: isAlertOrCritical
          ? '0 2px 20px rgba(255, 48, 48, 0.3)'
          : '0 2px 20px rgba(0, 255, 255, 0.1)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-bold tracking-[0.3em]"
          style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
        >
          CYBER NEWS MAP
        </span>
        <span className="text-cyber-text-dim">///</span>
        <span className="text-cyber-text-dim">JAPAN</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-cyber-text-dim">JST</span>
          <span style={{ color: '#00ffff' }}>{formatJST(currentTime)}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isLoading ? '#ff8800' : '#00ff88',
              boxShadow: `0 0 6px ${isLoading ? '#ff8800' : '#00ff88'}`,
              animation: isLoading ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span className="text-cyber-text-dim">FEEDS</span>
          <span className="text-cyber-text">3</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-text-dim">NEWS</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={totalCount}
              style={{ color: '#00ffff' }}
              initial={{ scale: 1 }}
              animate={flashEvent?.source === 'news' ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {totalCount}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: JMA_STATUS_COLORS[jmaStatus.p2pquake],
              boxShadow: `0 0 6px ${JMA_STATUS_COLORS[jmaStatus.p2pquake]}`,
              animation: jmaStatus.p2pquake === 'loading' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span className="text-cyber-text-dim">QUAKE</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: JMA_STATUS_COLORS[jmaStatus.jmaWarning],
              boxShadow: `0 0 6px ${JMA_STATUS_COLORS[jmaStatus.jmaWarning]}`,
              animation: jmaStatus.jmaWarning === 'loading' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span className="text-cyber-text-dim">WARN</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-text-dim">SYNC</span>
          <span className="text-cyber-text">
            {lastUpdated ? formatJST(lastUpdated) : '--:--:--'}
          </span>
        </div>

        <div className="text-[9px]" style={{ color: '#555566' }}>
          地震情報: P2P地震情報 | 気象警報: 気象庁
        </div>
      </div>
    </header>
  );
}
