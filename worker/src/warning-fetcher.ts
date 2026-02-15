import type { WarningAreaSummary, ActiveWarning } from './types';
import { getWarningDef } from './warning-codes';
import { resolveAreaCode } from './area-code-map';

const MAP_JSON_URL = 'https://www.jma.go.jp/bosai/warning/data/warning/map.json';

interface RawWarning {
  code: string;
  status: string;
}

interface RawArea {
  code: string;
  warnings: RawWarning[];
}

interface RawAreaType {
  areas: RawArea[];
}

interface RawMapEntry {
  reportDatetime: string;
  areaTypes: RawAreaType[];
}

const SEVERITY_RANK: Record<string, number> = {
  special: 3,
  warning: 2,
  advisory: 1,
  none: 0,
};

function computeMaxSeverity(
  warnings: ActiveWarning[],
): 'special' | 'warning' | 'advisory' | 'none' {
  let max: 'special' | 'warning' | 'advisory' | 'none' = 'none';
  for (const w of warnings) {
    if (SEVERITY_RANK[w.severity] > SEVERITY_RANK[max]) {
      max = w.severity;
    }
  }
  return max;
}

export async function fetchWarnings(): Promise<{
  warnings: WarningAreaSummary[];
  status: 'ok' | 'error';
}> {
  try {
    const res = await fetch(MAP_JSON_URL);
    if (!res.ok) {
      return { warnings: [], status: 'error' };
    }

    const raw: RawMapEntry[] = await res.json();

    // 都道府県別にマージするためのマップ
    const prefMap = new Map<
      string,
      {
        areaCode: string;
        prefectureName: string;
        activeWarnings: ActiveWarning[];
        reportDatetime: string;
      }
    >();

    for (const entry of raw) {
      // areaTypes[0] のみ使用（最粗粒度）
      const firstAreaType = entry.areaTypes?.[0];
      if (!firstAreaType?.areas) continue;

      for (const area of firstAreaType.areas) {
        const prefName = resolveAreaCode(area.code);
        if (!prefName) continue;

        // status が "解除" または "発表警報・注意報はなし" のものを除外
        const activeRaw = (area.warnings ?? []).filter(
          (w) =>
            w.status !== '解除' && w.status !== '発表警報・注意報はなし',
        );

        if (activeRaw.length === 0) continue;

        const warnings: ActiveWarning[] = activeRaw.map((w) => {
          const def = getWarningDef(w.code);
          return {
            code: w.code,
            name: def.name,
            severity: def.severity,
            status: w.status,
          };
        });

        // 同一都道府県にマージ（北海道は複数officesあり）
        const existing = prefMap.get(prefName);
        if (existing) {
          // 既存の警報リストに追加（重複コードは除外）
          const existingCodes = new Set(existing.activeWarnings.map((w) => w.code));
          for (const w of warnings) {
            if (!existingCodes.has(w.code)) {
              existing.activeWarnings.push(w);
              existingCodes.add(w.code);
            }
          }
          // より新しい reportDatetime を採用
          if (entry.reportDatetime > existing.reportDatetime) {
            existing.reportDatetime = entry.reportDatetime;
          }
        } else {
          prefMap.set(prefName, {
            areaCode: area.code,
            prefectureName: prefName,
            activeWarnings: warnings,
            reportDatetime: entry.reportDatetime,
          });
        }
      }
    }

    const result: WarningAreaSummary[] = Array.from(prefMap.values()).map(
      (entry) => ({
        areaCode: entry.areaCode,
        areaName: entry.prefectureName,
        prefectureName: entry.prefectureName,
        maxSeverity: computeMaxSeverity(entry.activeWarnings),
        activeWarnings: entry.activeWarnings,
        reportDatetime: entry.reportDatetime,
      }),
    );

    return { warnings: result, status: 'ok' };
  } catch {
    return { warnings: [], status: 'error' };
  }
}
