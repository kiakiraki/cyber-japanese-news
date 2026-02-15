import { useState } from 'react';
import { useNewsData } from './hooks/useNewsData';
import { useJmaData } from './hooks/useJmaData';
import { useBreakingDetection } from './hooks/useBreakingDetection';
import { GridBackground } from './components/GridBackground';
import { ScanlineOverlay } from './components/ScanlineOverlay';
import { StatsBar } from './components/StatsBar';
import { JapanMap } from './components/JapanMap';
import { NewsSidePanel } from './components/NewsSidePanel';
import { BreakingBanner } from './components/BreakingBanner';
import { TsunamiBanner } from './components/TsunamiBanner';
import { WarningBanner } from './components/WarningBanner';

function App() {
  const { news, newsByPrefecture, totalCount, lastUpdated, isLoading } = useNewsData();
  const jmaData = useJmaData();
  const { currentBreaking, breakingQueue, dismissCurrent } = useBreakingDetection(
    news,
    jmaData.earthquakes,
    jmaData.tsunamis,
    jmaData.warnings,
  );
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      <GridBackground />

      <WarningBanner warnings={jmaData.warnings} />
      <TsunamiBanner tsunamis={jmaData.tsunamis} />

      <StatsBar
        totalCount={totalCount}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        jmaStatus={jmaData.status}
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
          />
        </div>

        {/* Side panel */}
        <NewsSidePanel
          selectedPrefecture={selectedPrefecture}
          news={news}
          newsByPrefecture={newsByPrefecture}
          earthquakes={jmaData.earthquakes}
          warnings={jmaData.warnings}
        />
      </div>

      <BreakingBanner
        currentBreaking={currentBreaking}
        queueSize={breakingQueue.length}
        onDismiss={dismissCurrent}
      />

      <ScanlineOverlay />
    </div>
  );
}

export default App;
