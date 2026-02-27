import { describe, it, expect } from 'vitest';
import { getZoomTier, getMaxCardsForTier } from './useMapZoom';

describe('getZoomTier', () => {
  it('k < 2.0 は country を返す', () => {
    expect(getZoomTier(1.0)).toBe('country');
    expect(getZoomTier(1.9)).toBe('country');
  });

  it('2.0 <= k < 4.5 は region を返す', () => {
    expect(getZoomTier(2.0)).toBe('region');
    expect(getZoomTier(3.0)).toBe('region');
    expect(getZoomTier(4.4)).toBe('region');
  });

  it('k >= 4.5 は prefecture を返す', () => {
    expect(getZoomTier(4.5)).toBe('prefecture');
    expect(getZoomTier(8.0)).toBe('prefecture');
  });
});

describe('getMaxCardsForTier', () => {
  it('country は 5 を返す', () => {
    expect(getMaxCardsForTier('country')).toBe(5);
  });

  it('region は 8 を返す', () => {
    expect(getMaxCardsForTier('region')).toBe(8);
  });

  it('prefecture は 12 を返す', () => {
    expect(getMaxCardsForTier('prefecture')).toBe(12);
  });
});
