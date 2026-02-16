import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { NewsItem } from '../types/news';
import type { EarthquakeItem, WarningAreaSummary } from '../types/jma';
import { PREFECTURE_MAP } from '../lib/prefectures';
import { EpicenterMarker } from './EpicenterMarker';
import { SeismicOverlay } from './SeismicOverlay';
import { WarningOverlay } from './WarningOverlay';
import { OgpCardLayer } from './OgpCardLayer';
import { ZoomControls } from './ZoomControls';
import { useMapZoom, getMaxCardsForTier } from '../hooks/useMapZoom';

interface JapanMapProps {
  newsByPrefecture: Map<string, NewsItem[]>;
  selectedPrefecture: string | null;
  onSelectPrefecture: (code: string | null) => void;
  earthquakes?: EarthquakeItem[];
  recentQuake?: EarthquakeItem | null;
  warnings?: WarningAreaSummary[];
  news?: NewsItem[];
  pulsePrefectures?: string[];
}

interface PrefectureProperties {
  nam: string;
  nam_ja: string;
  id: number;
}

const WIDTH = 800;
const HEIGHT = 800;

const CLICK_THRESHOLD = 5; // pixels — below this distance is a click, above is a drag

function createProjection() {
  return d3.geoMercator()
    .center([138, 35])
    .scale(1500)
    .translate([WIDTH / 2, HEIGHT / 2]);
}

export function JapanMap({
  newsByPrefecture,
  selectedPrefecture,
  onSelectPrefecture,
  earthquakes = [],
  recentQuake = null,
  warnings = [],
  news = [],
  pulsePrefectures = [],
}: JapanMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const [topology, setTopology] = useState<Topology | null>(null);
  const [prefecturePaths, setPrefecturePaths] = useState<Map<string, string>>(new Map());

  // Track mouse position for click vs drag detection
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const projection = useMemo(() => createProjection(), []);
  const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

  const { zoomState, zoomIn, zoomOut, resetZoom, zoomToPoint, tier } = useMapZoom(svgRef, {
    width: WIDTH,
    height: HEIGHT,
  });

  const inverseScale = 1 / zoomState.k;
  const maxCards = getMaxCardsForTier(tier);

  useEffect(() => {
    fetch('/japan-topo.json')
      .then((res) => res.json())
      .then((data) => setTopology(data));
  }, []);

  // Handle prefecture click with auto-zoom
  const handleClick = useCallback(
    (code: string) => {
      if (selectedPrefecture === code) {
        // Deselect + reset zoom
        onSelectPrefecture(null);
        resetZoom();
      } else {
        // Select + zoom to prefecture
        onSelectPrefecture(code);
        const pref = PREFECTURE_MAP.get(code);
        if (pref) {
          const coords = projection([pref.lng, pref.lat]);
          if (coords) {
            zoomToPoint(coords[0], coords[1], 4);
          }
        }
      }
    },
    [selectedPrefecture, onSelectPrefecture, resetZoom, zoomToPoint, projection]
  );

  // Click on empty space → deselect + reset zoom
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (mouseDownPos.current) {
        const dx = e.clientX - mouseDownPos.current.x;
        const dy = e.clientY - mouseDownPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > CLICK_THRESHOLD) return;
      }
      if (selectedPrefecture) {
        onSelectPrefecture(null);
        resetZoom();
      }
    },
    [selectedPrefecture, onSelectPrefecture, resetZoom]
  );

  // D3 rendering: base map + news markers
  useEffect(() => {
    if (!topology || !mapGroupRef.current) return;

    const g = d3.select(mapGroupRef.current);
    g.selectAll('*').remove();

    const geojson = topojson.feature(
      topology,
      topology.objects.japan as GeometryCollection<PrefectureProperties>
    );

    // Build prefecture name -> path 'd' mapping for SeismicOverlay
    const pathMap = new Map<string, string>();
    for (const feature of geojson.features) {
      const d = pathGenerator(feature as never);
      if (d && feature.properties.nam_ja) {
        pathMap.set(feature.properties.nam_ja, d);
      }
    }
    setPrefecturePaths(pathMap);

    // Prefecture paths
    g.selectAll<SVGPathElement, (typeof geojson.features)[number]>('path')
      .data(geojson.features)
      .join('path')
      .attr('d', pathGenerator as never)
      .attr('fill', (d) => {
        const code = String(d.properties.id).padStart(2, '0');
        if (code === selectedPrefecture) return 'rgba(0, 255, 255, 0.25)';
        const hasNews = newsByPrefecture.has(code);
        return hasNews ? 'rgba(0, 255, 255, 0.06)' : 'rgba(0, 255, 255, 0.02)';
      })
      .attr('stroke', '#00ffff')
      .attr('stroke-width', 0.5)
      .attr('data-base-stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .style('transition', 'fill 0.3s ease')
      .on('mouseenter', function (_, d) {
        const code = String(d.properties.id).padStart(2, '0');
        if (code !== selectedPrefecture) {
          d3.select(this).attr('fill', 'rgba(0, 255, 255, 0.15)');
        }
      })
      .on('mouseleave', function (_, d) {
        const code = String(d.properties.id).padStart(2, '0');
        if (code === selectedPrefecture) {
          d3.select(this).attr('fill', 'rgba(0, 255, 255, 0.25)');
        } else {
          const hasNews = newsByPrefecture.has(code);
          d3.select(this).attr('fill', hasNews ? 'rgba(0, 255, 255, 0.06)' : 'rgba(0, 255, 255, 0.02)');
        }
      })
      .on('click', (event: MouseEvent, d) => {
        event.stopPropagation();
        // Check if this was a drag rather than a click
        if (mouseDownPos.current) {
          const dx = event.clientX - mouseDownPos.current.x;
          const dy = event.clientY - mouseDownPos.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > CLICK_THRESHOLD) return;
        }
        const code = String(d.properties.id).padStart(2, '0');
        handleClick(code);
      });

    // News markers (defs)
    const defs = g.append('defs');

    const pulseNormal = defs.append('radialGradient').attr('id', 'pulse-normal');
    pulseNormal.append('stop').attr('offset', '0%').attr('stop-color', '#00ffff').attr('stop-opacity', 0.8);
    pulseNormal.append('stop').attr('offset', '100%').attr('stop-color', '#00ffff').attr('stop-opacity', 0);

    const pulseBreaking = defs.append('radialGradient').attr('id', 'pulse-breaking');
    pulseBreaking.append('stop').attr('offset', '0%').attr('stop-color', '#ff3030').attr('stop-opacity', 0.9);
    pulseBreaking.append('stop').attr('offset', '100%').attr('stop-color', '#ff8800').attr('stop-opacity', 0);

    const markersGroup = g.append('g').attr('class', 'markers');

    for (const [code, items] of newsByPrefecture) {
      if (code === 'national') continue;
      const pref = PREFECTURE_MAP.get(code);
      if (!pref) continue;

      const [x, y] = projection([pref.lng, pref.lat]) ?? [0, 0];
      const hasBreaking = items.some((item) => item.isBreaking);
      const baseSize = Math.min(4 + items.length * 2, 16);

      // Ripple effect for breaking
      if (hasBreaking) {
        for (let i = 0; i < 3; i++) {
          markersGroup
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', baseSize)
            .attr('fill', 'none')
            .attr('stroke', '#ff3030')
            .attr('stroke-width', 1)
            .attr('data-base-stroke-width', 1)
            .attr('opacity', 0)
            .append('animate')
            .attr('attributeName', 'r')
            .attr('values', `${baseSize};${baseSize + 20}`)
            .attr('dur', '2s')
            .attr('begin', `${i * 0.6}s`)
            .attr('repeatCount', 'indefinite')
          markersGroup
            .selectAll('circle:last-child')
            .append('animate')
            .attr('attributeName', 'opacity')
            .attr('values', '0.6;0')
            .attr('dur', '2s')
            .attr('begin', `${i * 0.6}s`)
            .attr('repeatCount', 'indefinite');
        }
      }

      // Outer glow
      markersGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', baseSize + 4)
        .attr('data-base-r', baseSize + 4)
        .attr('fill', `url(#${hasBreaking ? 'pulse-breaking' : 'pulse-normal'})`)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', `${baseSize + 2};${baseSize + 8};${baseSize + 2}`)
        .attr('dur', hasBreaking ? '1s' : '3s')
        .attr('repeatCount', 'indefinite');

      // Core dot
      markersGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', baseSize)
        .attr('data-base-r', baseSize)
        .attr('fill', hasBreaking ? '#ff3030' : '#00ffff')
        .attr('opacity', 0.9)
        .attr('cursor', 'pointer')
        .on('click', (event: MouseEvent) => {
          event.stopPropagation();
          if (mouseDownPos.current) {
            const dx = event.clientX - mouseDownPos.current.x;
            const dy = event.clientY - mouseDownPos.current.y;
            if (Math.sqrt(dx * dx + dy * dy) > CLICK_THRESHOLD) return;
          }
          handleClick(code);
        });

      // Count label
      if (items.length > 1) {
        markersGroup
          .append('text')
          .attr('x', x)
          .attr('y', y + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#000')
          .attr('font-size', Math.max(baseSize - 2, 8))
          .attr('data-base-font', Math.max(baseSize - 2, 8))
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(items.length);
      }
    }
  }, [topology, newsByPrefecture, selectedPrefecture, handleClick, projection, pathGenerator]);

  // Inverse-scale correction for D3-managed elements when zoom changes
  useEffect(() => {
    if (!mapGroupRef.current) return;
    const g = d3.select(mapGroupRef.current);
    const k = zoomState.k;
    const inv = 1 / k;

    // Stroke widths
    g.selectAll<SVGElement, unknown>('[data-base-stroke-width]').each(function () {
      const el = d3.select(this);
      const base = parseFloat(el.attr('data-base-stroke-width'));
      el.attr('stroke-width', base * inv);
    });

    // Circle radii (static, not animated)
    g.selectAll<SVGCircleElement, unknown>('circle[data-base-r]').each(function () {
      const el = d3.select(this);
      const base = parseFloat(el.attr('data-base-r'));
      el.attr('r', base * inv);
    });

    // Font sizes
    g.selectAll<SVGTextElement, unknown>('text[data-base-font]').each(function () {
      const el = d3.select(this);
      const base = parseFloat(el.attr('data-base-font'));
      el.attr('font-size', base * inv);
    });
  }, [zoomState.k]);

  // Pulse rings for effect prefectures
  useEffect(() => {
    if (!topology || !mapGroupRef.current || pulsePrefectures.length === 0) return;

    const g = d3.select(mapGroupRef.current);
    const pulseGroup = g.select<SVGGElement>('.pulse-rings');
    if (!pulseGroup.empty()) pulseGroup.remove();

    const pg = g.append('g').attr('class', 'pulse-rings');

    for (const code of pulsePrefectures) {
      const pref = PREFECTURE_MAP.get(code);
      if (!pref) continue;
      const [x, y] = projection([pref.lng, pref.lat]) ?? [0, 0];

      for (let i = 0; i < 2; i++) {
        pg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 4)
          .attr('fill', 'none')
          .attr('stroke', '#00ffff')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.7)
          .transition()
          .delay(i * 300)
          .duration(1500)
          .attr('r', 30)
          .attr('opacity', 0)
          .remove();
      }
    }
  }, [pulsePrefectures, topology, projection]);

  // Compute epicenter positions
  const epicenterPositions = useMemo(() => {
    return earthquakes
      .filter((eq) => eq.hypocenter.latitude && eq.hypocenter.longitude)
      .map((eq) => {
        const coords = projection([eq.hypocenter.longitude, eq.hypocenter.latitude]);
        return { earthquake: eq, x: coords?.[0] ?? 0, y: coords?.[1] ?? 0 };
      });
  }, [earthquakes, projection]);

  const transformStr = `translate(${zoomState.x}, ${zoomState.y}) scale(${zoomState.k})`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full"
        style={{ maxHeight: 'calc(100vh - 60px)', touchAction: 'none', overflow: 'hidden' }}
        onMouseDown={(e) => {
          mouseDownPos.current = { x: e.clientX, y: e.clientY };
        }}
      >
        {/* Zoom transform wrapper — all map layers inside */}
        <g transform={transformStr}>
          {/* Transparent background — click to deselect */}
          <rect
            x={-WIDTH}
            y={-HEIGHT}
            width={WIDTH * 3}
            height={HEIGHT * 3}
            fill="transparent"
            onClick={handleBackgroundClick}
          />

          {/* D3-managed: base map + news markers */}
          <g ref={mapGroupRef} />

          {/* React-managed: warning overlay (below seismic) */}
          <WarningOverlay warnings={warnings} prefecturePaths={prefecturePaths} />

          {/* React-managed: seismic overlay (above warning) */}
          <SeismicOverlay recentQuake={recentQuake} prefecturePaths={prefecturePaths} />

          {/* React-managed: OGP news cards */}
          <OgpCardLayer
            news={news}
            projection={projection}
            inverseScale={inverseScale}
            maxCards={maxCards}
          />

          {/* React-managed: epicenter markers */}
          {epicenterPositions.map(({ earthquake, x, y }) => (
            <EpicenterMarker
              key={earthquake.id}
              earthquake={earthquake}
              x={x}
              y={y}
              inverseScale={inverseScale}
            />
          ))}
        </g>
      </svg>

      {/* Zoom controls — outside SVG as HTML overlay */}
      <ZoomControls
        tier={tier}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
      />
    </div>
  );
}
