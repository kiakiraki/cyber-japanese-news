import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchWarnings } from './warning-fetcher';

function mockMapJson(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchWarnings', () => {
  it('警報を都道府県別サマリに変換する', async () => {
    mockMapJson([
      {
        reportDatetime: '2026-07-04T00:00:00+09:00',
        areaTypes: [
          {
            areas: [
              {
                code: '130000',
                warnings: [
                  { code: '03', status: '発表' },
                  { code: '10', status: '継続' },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const { warnings, status } = await fetchWarnings();
    expect(status).toBe('ok');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].prefectureName).toBe('東京都');
    expect(warnings[0].maxSeverity).toBe('warning');
    expect(warnings[0].activeWarnings.map((w) => w.name)).toEqual(['大雨警報', '大雨注意報']);
  });

  it('解除・発表なしの警報を除外する', async () => {
    mockMapJson([
      {
        reportDatetime: '2026-07-04T00:00:00+09:00',
        areaTypes: [
          {
            areas: [
              { code: '130000', warnings: [{ code: '03', status: '解除' }] },
              { code: '270000', warnings: [{ code: '05', status: '発表警報・注意報はなし' }] },
            ],
          },
        ],
      },
    ]);

    const { warnings } = await fetchWarnings();
    expect(warnings).toHaveLength(0);
  });

  it('同一都道府県の複数エントリをマージし重複コードを除外する（北海道の複数offices）', async () => {
    mockMapJson([
      {
        reportDatetime: '2026-07-04T00:00:00+09:00',
        areaTypes: [
          { areas: [{ code: '011000', warnings: [{ code: '06', status: '発表' }] }] },
        ],
      },
      {
        reportDatetime: '2026-07-04T01:00:00+09:00',
        areaTypes: [
          {
            areas: [
              {
                code: '012000',
                warnings: [
                  { code: '06', status: '継続' },
                  { code: '32', status: '発表' },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const { warnings } = await fetchWarnings();
    expect(warnings).toHaveLength(1);
    expect(warnings[0].prefectureName).toBe('北海道');
    expect(warnings[0].activeWarnings.map((w) => w.code).sort()).toEqual(['06', '32']);
    expect(warnings[0].maxSeverity).toBe('special');
    expect(warnings[0].reportDatetime).toBe('2026-07-04T01:00:00+09:00');
  });

  it('HTTPエラー時は status: error と空リストを返す', async () => {
    mockMapJson({}, false);
    const { warnings, status } = await fetchWarnings();
    expect(status).toBe('error');
    expect(warnings).toHaveLength(0);
  });
});
