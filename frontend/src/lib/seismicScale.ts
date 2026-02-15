import type { SeismicIntensity } from '../types/jma';

export interface ScaleInfo {
  label: string;
  labelEn: string;
  color: string;
  glowColor: string;
  severity: number; // 0-1
}

const SCALE_MAP: Record<SeismicIntensity, ScaleInfo> = {
  10: {
    label: '震度1',
    labelEn: '1',
    color: '#6ee7e7',
    glowColor: 'rgba(110, 231, 231, 0.4)',
    severity: 0.1,
  },
  20: {
    label: '震度2',
    labelEn: '2',
    color: '#38d9a9',
    glowColor: 'rgba(56, 217, 169, 0.4)',
    severity: 0.2,
  },
  30: {
    label: '震度3',
    labelEn: '3',
    color: '#ffd43b',
    glowColor: 'rgba(255, 212, 59, 0.4)',
    severity: 0.35,
  },
  40: {
    label: '震度4',
    labelEn: '4',
    color: '#ff922b',
    glowColor: 'rgba(255, 146, 43, 0.5)',
    severity: 0.5,
  },
  45: {
    label: '震度5弱',
    labelEn: '5-',
    color: '#ff6b6b',
    glowColor: 'rgba(255, 107, 107, 0.6)',
    severity: 0.65,
  },
  50: {
    label: '震度5強',
    labelEn: '5+',
    color: '#f03e3e',
    glowColor: 'rgba(240, 62, 62, 0.6)',
    severity: 0.75,
  },
  55: {
    label: '震度6弱',
    labelEn: '6-',
    color: '#d62828',
    glowColor: 'rgba(214, 40, 40, 0.7)',
    severity: 0.85,
  },
  60: {
    label: '震度6強',
    labelEn: '6+',
    color: '#b91c8b',
    glowColor: 'rgba(185, 28, 139, 0.7)',
    severity: 0.92,
  },
  70: {
    label: '震度7',
    labelEn: '7',
    color: '#9b19f5',
    glowColor: 'rgba(155, 25, 245, 0.8)',
    severity: 1.0,
  },
};

export function getScaleInfo(scale: number): ScaleInfo {
  return (
    SCALE_MAP[scale as SeismicIntensity] ?? {
      label: `震度?`,
      labelEn: '?',
      color: '#888899',
      glowColor: 'rgba(136, 136, 153, 0.3)',
      severity: 0,
    }
  );
}

export function getEpicenterColor(magnitude: number): string {
  if (magnitude >= 5.5) return '#f03e3e';
  if (magnitude >= 4.0) return '#ff922b';
  return '#00ffff';
}

export function getEpicenterDotSize(magnitude: number): number {
  return Math.max(4, Math.min(magnitude * 2, 20));
}
