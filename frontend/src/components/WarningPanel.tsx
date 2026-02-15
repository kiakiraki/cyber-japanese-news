import { useState } from 'react';
import type { WarningAreaSummary } from '../types/jma';
import { severityRank, SEVERITY_COLORS } from '../lib/warningCodes';

interface WarningPanelProps {
  warnings: WarningAreaSummary[];
}

function sortWarnings(warnings: WarningAreaSummary[]): WarningAreaSummary[] {
  return [...warnings].sort((a, b) => {
    const sevDiff = severityRank(b.maxSeverity) - severityRank(a.maxSeverity);
    if (sevDiff !== 0) return sevDiff;
    return a.areaCode.localeCompare(b.areaCode);
  });
}

export function WarningPanel({ warnings }: WarningPanelProps) {
  const [showAdvisory, setShowAdvisory] = useState(false);

  const filtered = showAdvisory
    ? warnings
    : warnings.filter((w) => w.maxSeverity === 'special' || w.maxSeverity === 'warning');

  const sorted = sortWarnings(filtered);

  return (
    <div
      className="px-3 py-2 shrink-0"
      style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] tracking-[0.2em]" style={{ color: '#ff2800' }}>
          WEATHER ALERTS
        </div>
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
      </div>

      {sorted.length === 0 && !showAdvisory && warnings.length > 0 ? (
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
    </div>
  );
}
