import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchJmaData } from './jma-fetcher';

const HOUR = 60 * 60 * 1000;

function isoAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function makeQuake(overrides: Record<string, unknown> = {}) {
  const { earthquake: quakeOverrides, ...rest } = overrides;
  return {
    id: 'quake-1',
    code: 551,
    time: isoAgo(HOUR),
    issue: { source: 'jma', time: isoAgo(HOUR), type: 'DetailScale' },
    earthquake: {
      time: isoAgo(HOUR),
      hypocenter: { name: '茨城県沖', latitude: 36.4, longitude: 140.6, depth: 50, magnitude: 5.2 },
      maxScale: 30,
      domesticTsunami: 'None',
      ...(quakeOverrides as object | undefined),
    },
    points: [],
    ...rest,
  };
}

/** P2P API (551/552) と気象庁 map.json をURLで振り分けてモックする */
function mockApis({
  quakes = [] as unknown[],
  tsunamis = [] as unknown[],
  quakeStatus = 200,
} = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('codes=551')) {
        return new Response(JSON.stringify(quakes), { status: quakeStatus });
      }
      if (url.includes('codes=552')) {
        return new Response(JSON.stringify(tsunamis), { status: 200 });
      }
      // 気象庁 map.json
      return new Response(JSON.stringify([]), { status: 200 });
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJmaData', () => {
  it('地震データを変換し、都道府県ごとの最大震度を集計する', async () => {
    mockApis({
      quakes: [
        makeQuake({
          points: [
            { pref: '茨城県', addr: '水戸市', isArea: false, scale: 30 },
            { pref: '茨城県', addr: '日立市', isArea: false, scale: 40 },
            { pref: '栃木県', addr: '宇都宮市', isArea: false, scale: 20 },
          ],
          earthquake: { maxScale: 40 },
        }),
      ],
    });

    const { earthquakes, sources } = await fetchJmaData();
    expect(sources.p2pquake).toBe('ok');
    expect(earthquakes).toHaveLength(1);
    expect(earthquakes[0].isBreaking).toBe(true); // maxScale >= 40
    expect(earthquakes[0].prefectureIntensities).toContainEqual({ pref: '茨城県', maxScale: 40 });
    expect(earthquakes[0].prefectureIntensities).toContainEqual({ pref: '栃木県', maxScale: 20 });
  });

  it('24時間より古い地震と震源名のない地震を除外する', async () => {
    mockApis({
      quakes: [
        makeQuake({ id: 'old', earthquake: { time: isoAgo(25 * HOUR) } }),
        makeQuake({ id: 'no-hypo', earthquake: { hypocenter: { name: '' } } }),
        makeQuake({ id: 'recent' }),
      ],
    });

    const { earthquakes } = await fetchJmaData();
    expect(earthquakes.map((e) => e.id)).toEqual(['recent']);
  });

  it('津波情報を変換し、解除済みは isBreaking にしない', async () => {
    mockApis({
      tsunamis: [
        {
          id: 'tsunami-1',
          code: 552,
          time: isoAgo(HOUR),
          issue: { source: 'jma', time: isoAgo(HOUR), type: 'Focus' },
          cancelled: false,
          areas: [{ name: '千葉県九十九里・外房', grade: 'Watch', immediate: false }],
        },
        {
          id: 'tsunami-2',
          code: 552,
          time: isoAgo(HOUR),
          issue: { source: 'jma', time: isoAgo(HOUR), type: 'Focus' },
          cancelled: true,
          areas: [],
        },
      ],
    });

    const { tsunamis } = await fetchJmaData();
    expect(tsunamis).toHaveLength(2);
    expect(tsunamis[0].isBreaking).toBe(true);
    expect(tsunamis[1].isBreaking).toBe(false);
  });

  it('P2P APIが落ちても警報データは返し、sources に部分失敗を反映する', async () => {
    mockApis({ quakeStatus: 500 });

    const { earthquakes, tsunamis, sources } = await fetchJmaData();
    expect(sources.p2pquake).toBe('error');
    expect(sources.jmaWarning).toBe('ok');
    expect(earthquakes).toHaveLength(0);
    expect(tsunamis).toHaveLength(0);
  });
});
