import { describe, it, expect } from 'vitest';
import { getScaleInfo, getEpicenterColor, getEpicenterDotSize } from './seismicScale';

describe('getScaleInfo', () => {
  it('震度1のスケール情報を返す', () => {
    const info = getScaleInfo(10);
    expect(info.label).toBe('震度1');
    expect(info.severity).toBe(0.1);
  });

  it('震度7のスケール情報を返す', () => {
    const info = getScaleInfo(70);
    expect(info.label).toBe('震度7');
    expect(info.severity).toBe(1.0);
  });

  it('震度5弱のスケール情報を返す', () => {
    const info = getScaleInfo(45);
    expect(info.label).toBe('震度5弱');
    expect(info.labelEn).toBe('5-');
  });

  it('未知のスケール値にはフォールバック値を返す', () => {
    const info = getScaleInfo(99);
    expect(info.label).toBe('震度?');
    expect(info.severity).toBe(0);
  });
});

describe('getEpicenterColor', () => {
  it('M5.5以上は赤色を返す', () => {
    expect(getEpicenterColor(5.5)).toBe('#f03e3e');
    expect(getEpicenterColor(7.0)).toBe('#f03e3e');
  });

  it('M4.0以上5.5未満はオレンジ色を返す', () => {
    expect(getEpicenterColor(4.0)).toBe('#ff922b');
    expect(getEpicenterColor(5.4)).toBe('#ff922b');
  });

  it('M4.0未満はシアン色を返す', () => {
    expect(getEpicenterColor(3.9)).toBe('#00ffff');
    expect(getEpicenterColor(1.0)).toBe('#00ffff');
  });
});

describe('getEpicenterDotSize', () => {
  it('magnitude * 2 を返す（範囲内の場合）', () => {
    expect(getEpicenterDotSize(5)).toBe(10);
  });

  it('最小値4を下回らない', () => {
    expect(getEpicenterDotSize(1)).toBe(4);
  });

  it('最大値20を超えない', () => {
    expect(getEpicenterDotSize(15)).toBe(20);
  });
});
