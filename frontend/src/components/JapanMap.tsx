import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { NewsItem } from '../types/news';
import { PREFECTURE_MAP } from '../lib/prefectures';

interface JapanMapProps {
  newsByPrefecture: Map<string, NewsItem[]>;
  selectedPrefecture: string | null;
  onSelectPrefecture: (code: string | null) => void;
}

interface PrefectureProperties {
  nam: string;
  nam_ja: string;
  id: number;
}

export function JapanMap({ newsByPrefecture, selectedPrefecture, onSelectPrefecture }: JapanMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<Topology | null>(null);

  useEffect(() => {
    fetch('/japan-topo.json')
      .then((res) => res.json())
      .then((data) => setTopology(data));
  }, []);

  const handleClick = useCallback(
    (code: string) => {
      onSelectPrefecture(selectedPrefecture === code ? null : code);
    },
    [selectedPrefecture, onSelectPrefecture]
  );

  useEffect(() => {
    if (!topology || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 800;

    const projection = d3.geoMercator()
      .center([138, 35])
      .scale(1500)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const geojson = topojson.feature(
      topology,
      topology.objects.japan as GeometryCollection<PrefectureProperties>
    );

    const g = svg.append('g');

    // Prefecture paths
    g.selectAll<SVGPathElement, (typeof geojson.features)[number]>('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path as never)
      .attr('fill', (d) => {
        const code = String(d.properties.id).padStart(2, '0');
        if (code === selectedPrefecture) return 'rgba(0, 255, 255, 0.25)';
        const hasNews = newsByPrefecture.has(code);
        return hasNews ? 'rgba(0, 255, 255, 0.06)' : 'rgba(0, 255, 255, 0.02)';
      })
      .attr('stroke', '#00ffff')
      .attr('stroke-width', 0.5)
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
      .on('click', (_, d) => {
        const code = String(d.properties.id).padStart(2, '0');
        handleClick(code);
      });

    // News markers
    const defs = svg.append('defs');

    // Pulse animation for normal markers
    const pulseNormal = defs.append('radialGradient').attr('id', 'pulse-normal');
    pulseNormal.append('stop').attr('offset', '0%').attr('stop-color', '#00ffff').attr('stop-opacity', 0.8);
    pulseNormal.append('stop').attr('offset', '100%').attr('stop-color', '#00ffff').attr('stop-opacity', 0);

    // Pulse animation for breaking markers
    const pulseBreaking = defs.append('radialGradient').attr('id', 'pulse-breaking');
    pulseBreaking.append('stop').attr('offset', '0%').attr('stop-color', '#ff3030').attr('stop-opacity', 0.9);
    pulseBreaking.append('stop').attr('offset', '100%').attr('stop-color', '#ff8800').attr('stop-opacity', 0);

    const markersGroup = svg.append('g').attr('class', 'markers');

    for (const [code, items] of newsByPrefecture) {
      if (code === 'national') continue;
      const pref = PREFECTURE_MAP.get(code);
      if (!pref) continue;

      const [x, y] = projection([pref.lng, pref.lat]) ?? [0, 0];
      const hasBreaking = items.some((item) => item.isBreaking);
      const size = Math.min(4 + items.length * 2, 16);

      // Ripple effect for breaking
      if (hasBreaking) {
        for (let i = 0; i < 3; i++) {
          markersGroup
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size)
            .attr('fill', 'none')
            .attr('stroke', '#ff3030')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .append('animate')
            .attr('attributeName', 'r')
            .attr('values', `${size};${size + 20}`)
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
        .attr('r', size + 4)
        .attr('fill', `url(#${hasBreaking ? 'pulse-breaking' : 'pulse-normal'})`)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', `${size + 2};${size + 8};${size + 2}`)
        .attr('dur', hasBreaking ? '1s' : '3s')
        .attr('repeatCount', 'indefinite');

      // Core dot
      markersGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', size)
        .attr('fill', hasBreaking ? '#ff3030' : '#00ffff')
        .attr('opacity', 0.9)
        .attr('cursor', 'pointer')
        .on('click', () => handleClick(code));

      // Count label
      if (items.length > 1) {
        markersGroup
          .append('text')
          .attr('x', x)
          .attr('y', y + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', hasBreaking ? '#000' : '#000')
          .attr('font-size', Math.max(size - 2, 8))
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(items.length);
      }
    }
  }, [topology, newsByPrefecture, selectedPrefecture, handleClick]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 800"
      className="w-full h-full"
      style={{ maxHeight: 'calc(100vh - 60px)' }}
    />
  );
}
