import type { WarningAreaSummary } from '../types/jma';

interface WarningOverlayProps {
  warnings: WarningAreaSummary[];
  prefecturePaths: Map<string, string>;
}

const SEVERITY_FILL: Record<string, { color: string; opacity: number }> = {
  special: { color: '#8b00ff', opacity: 0.5 },
  warning: { color: '#ff2800', opacity: 0.35 },
  advisory: { color: '#ffcc00', opacity: 0.2 },
};

export function WarningOverlay({ warnings, prefecturePaths }: WarningOverlayProps) {
  if (warnings.length === 0) return null;

  // 同一都道府県名で最高severity を採用
  const prefSeverityMap = new Map<string, 'special' | 'warning' | 'advisory'>();
  const severityRank = { special: 3, warning: 2, advisory: 1, none: 0 };

  for (const w of warnings) {
    if (w.maxSeverity === 'none') continue;
    const existing = prefSeverityMap.get(w.prefectureName);
    if (!existing || severityRank[w.maxSeverity] > severityRank[existing]) {
      prefSeverityMap.set(
        w.prefectureName,
        w.maxSeverity as 'special' | 'warning' | 'advisory',
      );
    }
  }

  return (
    <g className="warning-overlay">
      <style>{`
        @keyframes warning-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.25; }
        }
      `}</style>
      {Array.from(prefSeverityMap.entries()).map(([prefName, severity]) => {
        const pathD = prefecturePaths.get(prefName);
        if (!pathD) return null;

        const fill = SEVERITY_FILL[severity];

        return (
          <path
            key={`warn-${prefName}`}
            d={pathD}
            fill={fill.color}
            opacity={fill.opacity}
            style={{
              pointerEvents: 'none',
              animation:
                severity === 'special' ? 'warning-pulse 1s ease-in-out infinite' : 'none',
            }}
          />
        );
      })}
    </g>
  );
}
