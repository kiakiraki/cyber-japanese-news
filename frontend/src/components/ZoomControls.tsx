import type { ZoomTier } from '../hooks/useMapZoom';

interface ZoomControlsProps {
  tier: ZoomTier;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const TIER_LABELS: Record<ZoomTier, string> = {
  country: 'NATIONAL',
  region: 'REGION',
  prefecture: 'PREFECTURE',
};

const buttonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(10, 10, 20, 0.8)',
  border: '1px solid rgba(0, 255, 255, 0.4)',
  color: '#00ffff',
  fontSize: 18,
  fontFamily: 'JetBrains Mono, monospace',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
};

export function ZoomControls({ tier, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        bottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* Tier label */}
      <div
        style={{
          background: 'rgba(10, 10, 20, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          color: '#00ffff',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          padding: '3px 6px',
          textAlign: 'center',
          letterSpacing: '0.1em',
          marginBottom: 2,
        }}
      >
        {TIER_LABELS[tier]}
      </div>

      <button
        onClick={onZoomIn}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 10, 20, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
        }}
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        onClick={onZoomOut}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 10, 20, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
        }}
        aria-label="Zoom out"
      >
        −
      </button>

      <button
        onClick={onReset}
        style={{
          ...buttonStyle,
          fontSize: 11,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 10, 20, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
        }}
        aria-label="Reset zoom"
      >
        ⌂
      </button>
    </div>
  );
}
