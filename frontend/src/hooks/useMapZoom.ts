import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';

export type ZoomTier = 'country' | 'region' | 'prefecture';

export interface ZoomState {
  k: number;
  x: number;
  y: number;
}

const ZOOM_EXTENT: [number, number] = [1, 8];

export function getZoomTier(k: number): ZoomTier {
  if (k < 2.0) return 'country';
  if (k < 4.5) return 'region';
  return 'prefecture';
}

export function getMaxCardsForTier(tier: ZoomTier): number {
  switch (tier) {
    case 'country': return 5;
    case 'region': return 8;
    case 'prefecture': return 12;
  }
}

interface UseMapZoomOptions {
  width: number;
  height: number;
}

export function useMapZoom(svgRef: React.RefObject<SVGSVGElement | null>, options: UseMapZoomOptions) {
  const { width, height } = options;
  const [zoomState, setZoomState] = useState<ZoomState>({ k: 1, x: 0, y: 0 });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_EXTENT)
      .translateExtent([[-width * 0.5, -height * 0.5], [width * 1.5, height * 1.5]])
      .filter((event: Event) => {
        // Allow wheel, touch, and mouse drag (button 0 = left)
        if (event.type === 'wheel') return true;
        if (event.type === 'touchstart' || event.type === 'touchmove') return true;
        if (event.type === 'mousedown') {
          return (event as MouseEvent).button === 0;
        }
        return true;
      })
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform;
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          setZoomState({ k, x, y });
          rafRef.current = null;
        });
      });

    zoomBehaviorRef.current = zoom;

    const selection = d3.select(svg);
    selection.call(zoom);

    // Disable double-click zoom (conflicts with prefecture click)
    selection.on('dblclick.zoom', null);

    return () => {
      selection.on('.zoom', null);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [svgRef, width, height]);

  const zoomIn = useCallback(() => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(300).call(zoom.scaleBy, 1.5);
  }, [svgRef]);

  const zoomOut = useCallback(() => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
  }, [svgRef]);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg)
      .transition()
      .duration(500)
      .call(zoom.transform, d3.zoomIdentity);
  }, [svgRef]);

  const zoomToPoint = useCallback((cx: number, cy: number, targetScale = 4) => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-cx, -cy);

    d3.select(svg)
      .transition()
      .duration(600)
      .call(zoom.transform, transform);
  }, [svgRef, width, height]);

  return {
    zoomState,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToPoint,
    tier: getZoomTier(zoomState.k),
  };
}
