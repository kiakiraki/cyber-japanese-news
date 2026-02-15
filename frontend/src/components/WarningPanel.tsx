import { useState, useEffect } from 'react';
import type { WarningAreaSummary } from '../types/jma';
import { severityRank, SEVERITY_COLORS } from '../lib/warningCodes';
import { PREFECTURE_MAP } from '../lib/prefectures';

interface WarningPanelProps {
  warnings: WarningAreaSummary[];
  expanded?: boolean;
  selectedPrefecture?: string | null;
}

function sortWarnings(warnings: WarningAreaSummary[]): WarningAreaSummary[] {
  return [...warnings].sort((a, b) => {
    const sevDiff = severityRank(b.maxSeverity) - severityRank(a.maxSeverity);
    if (sevDiff !== 0) return sevDiff;
    return a.areaCode.localeCompare(b.areaCode);
  });
}

export function WarningPanel({ warnings, expanded, selectedPrefecture }: WarningPanelProps) {
  const [showAdvisory, setShowAdvisory] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sync with external expanded prop
  useEffect(() => {
    if (expanded !== undefined) {
      setIsOpen(expanded);
      setShowAdvisory(expanded);
    }
  }, [expanded]);

  // Filter by selected prefecture
  const prefName = selectedPrefecture
    ? PREFECTURE_MAP.get(selectedPrefecture)?.name ?? null
    : null;

  const prefFiltered = prefName
    ? warnings.filter((w) => w.prefectureName === prefName)
    : warnings;

  const filtered = showAdvisory
    ? prefFiltered
    : prefFiltered.filter((w) => w.maxSeverity === 'special' || w.maxSeverity === 'warning');

  const sorted = sortWarnings(filtered);

  const alertCount = prefFiltered.length;

  return (
    <div
      className="px-3 py-2 shrink-0"
      style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-[10px] tracking-[0.2em] transition-colors hover:brightness-125"
          style={{ color: '#ff2800' }}
        >
          <span
            className="inline-block transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
          WEATHER ALERTS
          {alertCount > 0 && (
            <span
              className="text-[9px] px-1 py-0.5 rounded"
              style={{
                color: '#ff2800',
                border: '1px solid rgba(255, 40, 0, 0.3)',
                backgroundColor: 'rgba(255, 40, 0, 0.08)',
              }}
            >
              {alertCount}
            </span>
          )}
        </button>
        {isOpen && (
          <button
            onClick={() => setShowAdvisory((prev) => !prev)}
            className="text-[9px] px-1.5 py-0.5 rounded transition-colors"
            style={{
              color: showAdvisory ? '#ffcc00' : '#555566',
              border: `1px solid ${showAdvisory ? 'rgba(255, 204, 0, 0.3)' : 'rgba(85, 85, 102, 0.3)'}`,
              background: showAdvisory ? 'rgba(255, 204, 0, 0.08)' : 'transparent',
            }}
          >
            {showAdvisory ? 'HIDE' : 'SHOW'} ADVISORY
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {sorted.length === 0 && !showAdvisory && prefFiltered.length > 0 ? (
            <div className="text-[10px] tracking-wider py-1" style={{ color: '#555566' }}>
              ADVISORIES ONLY — TOGGLE TO VIEW
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-[10px] tracking-wider py-1 font-bold"
              style={{ color: '#00ff88' }}
            >
              ALL CLEAR
            </div>
          ) : (
            <div className="space-y-1.5">
              {sorted.map((w) => {
                const accentColor =
                  SEVERITY_COLORS[w.maxSeverity as keyof typeof SEVERITY_COLORS] ??
                  SEVERITY_COLORS.none;

                return (
                  <div
                    key={`${w.areaCode}-${w.maxSeverity}`}
                    className="px-2 py-1.5 rounded text-[11px]"
                    style={{
                      background: 'rgba(18, 18, 26, 0.6)',
                      borderLeft: `3px solid ${accentColor}`,
                    }}
                  >
                    <div className="font-bold mb-0.5" style={{ color: '#e0e0e0' }}>
                      {w.prefectureName}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {w.activeWarnings
                        .filter((aw) => showAdvisory || aw.severity !== 'advisory')
                        .map((aw) => {
                          const awColor =
                            SEVERITY_COLORS[aw.severity as keyof typeof SEVERITY_COLORS] ??
                            SEVERITY_COLORS.none;
                          return (
                            <span
                              key={aw.code}
                              className="text-[9px] px-1 py-0.5 rounded"
                              style={{
                                color: awColor,
                                border: `1px solid ${awColor}40`,
                                backgroundColor: `${awColor}10`,
                              }}
                            >
                              {aw.name}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
