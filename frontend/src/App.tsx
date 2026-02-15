import { useState, useEffect, useCallback } from 'react';
import { useNewsData } from './hooks/useNewsData';
import { useJmaData } from './hooks/useJmaData';
import { useBreakingDetection } from './hooks/useBreakingDetection';
import { useUpdateDetection } from './hooks/useUpdateDetection';
import { GridBackground } from './components/GridBackground';
import { ScanlineOverlay } from './components/ScanlineOverlay';
import { StatsBar } from './components/StatsBar';
import { JapanMap } from './components/JapanMap';
import { NewsSidePanel } from './components/NewsSidePanel';
import { BreakingBanner } from './components/BreakingBanner';
import { TsunamiBanner } from './components/TsunamiBanner';
import { WarningBanner } from './components/WarningBanner';
import { EffectLayer } from './components/effects/EffectLayer';
import type { EffectLevel, UpdateEvent } from './types/effects';

function App() {
  const { news, newsByPrefecture, totalCount, lastUpdated, isLoading } = useNewsData();
  const jmaData = useJmaData();
  const { currentBreaking, breakingQueue, dismissCurrent } = useBreakingDetection(
    news,
    jmaData.earthquakes,
    jmaData.tsunamis,
    jmaData.warnings,
  );
  const { activeEvent, fireEvent } = useUpdateDetection(
    news,
    jmaData.earthquakes,
    jmaData.tsunamis,
    jmaData.warnings,
  );
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleShakeStart = useCallback(() => setIsShaking(true), []);
  const handleShakeEnd = useCallback(() => setIsShaking(false), []);

  // DEV keyboard shortcuts for testing effects
  useEffect(() => {
    if (import.meta.env.PROD) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const testEvents: Record<string, UpdateEvent> = {
        '1': {
          id: `test-incoming-${Date.now()}`,
          level: 'incoming' as EffectLevel,
          timestamp: Date.now(),
          source: 'news',
          prefectureCodes: [],
          headline: '[DEV] Lv.1 incoming テスト',
          newArticleCount: 2,
        },
        '2': {
          id: `test-alert-${Date.now()}`,
          level: 'alert' as EffectLevel,
          timestamp: Date.now(),
          source: 'earthquake',
          prefectureCodes: [],
          headline: '[DEV] Lv.2 alert テスト',
          magnitude: 4.2,
          maxScale: 40,
        },
        '3': {
          id: `test-critical-${Date.now()}`,
          level: 'critical' as EffectLevel,
          timestamp: Date.now(),
          source: 'earthquake',
          prefectureCodes: [],
          headline: '[DEV] Lv.3 critical テスト',
          magnitude: 6.8,
          maxScale: 60,
        },
      };

      const event = testEvents[e.key];
      if (event) {
        console.log(`[DEV Effect] Lv.${e.key} ${event.level} fired`);
        fireEvent(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fireEvent]);

  const isIntensified = activeEvent?.level === 'alert' || activeEvent?.level === 'critical';

  return (
    <div
      className="h-screen w-screen flex flex-col relative overflow-hidden"
      style={{
        background: '#0a0a0f',
        animation: isShaking ? 'screen-shake 0.1s infinite' : 'none',
      }}
    >
      <GridBackground />

      <WarningBanner warnings={jmaData.warnings} />
      <TsunamiBanner tsunamis={jmaData.tsunamis} />

      <StatsBar
        totalCount={totalCount}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        jmaStatus={jmaData.status}
        flashEvent={activeEvent}
      />

      <div className="flex flex-1 min-h-0">
        {/* Map area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <JapanMap
            newsByPrefecture={newsByPrefecture}
            selectedPrefecture={selectedPrefecture}
            onSelectPrefecture={setSelectedPrefecture}
            earthquakes={jmaData.earthquakes}
            recentQuake={jmaData.recentQuake}
            warnings={jmaData.warnings}
            news={news}
            pulsePrefectures={activeEvent?.prefectureCodes ?? []}
          />
        </div>

        {/* Side panel */}
        <NewsSidePanel
          selectedPrefecture={selectedPrefecture}
          news={news}
          newsByPrefecture={newsByPrefecture}
          earthquakes={jmaData.displayQuakes}
          warnings={jmaData.warnings}
        />
      </div>

      <BreakingBanner
        currentBreaking={currentBreaking}
        queueSize={breakingQueue.length}
        onDismiss={dismissCurrent}
      />

      <EffectLayer
        activeEvent={activeEvent}
        onShakeStart={handleShakeStart}
        onShakeEnd={handleShakeEnd}
      />

      <ScanlineOverlay intensified={isIntensified} />
    </div>
  );
}

export default App;
