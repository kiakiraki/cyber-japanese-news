import { useState, useEffect } from 'react';

interface StatsBarProps {
  totalCount: number;
  lastUpdated: Date | null;
  isLoading: boolean;
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

export function StatsBar({ totalCount, lastUpdated, isLoading }: StatsBarProps) {
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
        borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
        boxShadow: '0 2px 20px rgba(0, 255, 255, 0.1)',
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
          <span style={{ color: '#00ffff' }}>{totalCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-text-dim">SYNC</span>
          <span className="text-cyber-text">
            {lastUpdated ? formatJST(lastUpdated) : '--:--:--'}
          </span>
        </div>
      </div>
    </header>
  );
}
