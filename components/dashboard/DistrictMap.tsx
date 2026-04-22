'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  burdenColors,
  burdenLabels,
  formatNumber,
  dimensionShortLabel,
} from './constants';
import type { ClimateRiskType, DistrictFeature, GeoJSONData } from './types';

interface Props {
  geoData: GeoJSONData | null;
  isLoading: boolean;
  climateRiskType: ClimateRiskType;
}

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

function getBurdenLevel(f: DistrictFeature, risk: ClimateRiskType): number {
  const v = risk === 'flood' ? f.properties.tb_fld : f.properties.tb_wtrstr;
  return typeof v === 'number' ? v : -1;
}

function getBurdenBreakdown(f: DistrictFeature, risk: ClimateRiskType) {
  const p = f.properties;
  const climate =
    risk === 'flood'
      ? { label: 'Flood risk', active: p.d_fld === 1 }
      : { label: 'Water stress', active: p.d_wtrstr === 1 };
  return [
    { label: 'Poverty', active: p.d_pov === 1 },
    climate,
    { label: 'Low sanitation', active: p.d_lowsan === 1 },
  ];
}

export default function DistrictMap({ geoData, isLoading, climateRiskType }: Props) {
  const [hovered, setHovered] = useState<DistrictFeature | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const bounds = useMemo(() => {
    if (!geoData) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    geoData.features.forEach((feature) => {
      const processCoords = (coords: number[]) => {
        if (coords.length >= 2) {
          minX = Math.min(minX, coords[0]);
          maxX = Math.max(maxX, coords[0]);
          minY = Math.min(minY, coords[1]);
          maxY = Math.max(maxY, coords[1]);
        }
      };
      const processPolygon = (polygon: number[][]) => polygon.forEach(processCoords);
      if (feature.geometry.type === 'Polygon') {
        (feature.geometry.coordinates as number[][][]).forEach(processPolygon);
      } else if (feature.geometry.type === 'MultiPolygon') {
        (feature.geometry.coordinates as number[][][][]).forEach((mp) =>
          mp.forEach(processPolygon)
        );
      }
    });
    return { minX, minY, maxX, maxY };
  }, [geoData]);

  const projectCoords = useCallback(
    (lon: number, lat: number, width: number, height: number) => {
      if (!bounds) return { x: 0, y: 0 };
      const { minX, minY, maxX, maxY } = bounds;
      const padding = 20;
      const mapWidth = width - padding * 2;
      const mapHeight = height - padding * 2;
      const x = padding + ((lon - minX) / (maxX - minX)) * mapWidth;
      const y = padding + ((maxY - lat) / (maxY - minY)) * mapHeight;
      return { x, y };
    },
    [bounds]
  );

  const featureToPath = useCallback(
    (feature: DistrictFeature): string => {
      const paths: string[] = [];
      const simplifyRing = (ring: number[][], threshold = 50): number[][] => {
        if (ring.length <= threshold) return ring;
        const step = Math.ceil(ring.length / threshold);
        const simplified: number[][] = [];
        for (let i = 0; i < ring.length; i += step) simplified.push(ring[i]);
        if (simplified[simplified.length - 1] !== ring[ring.length - 1]) {
          simplified.push(ring[ring.length - 1]);
        }
        return simplified;
      };
      const processRing = (ring: number[][]) => {
        if (!ring || ring.length < 3) return '';
        const simp = simplifyRing(ring);
        const points: string[] = [];
        for (const coord of simp) {
          if (
            !coord ||
            coord.length < 2 ||
            typeof coord[0] !== 'number' ||
            typeof coord[1] !== 'number' ||
            !isFinite(coord[0]) ||
            !isFinite(coord[1])
          ) {
            continue;
          }
          const { x, y } = projectCoords(coord[0], coord[1], MAP_WIDTH, MAP_HEIGHT);
          if (!isFinite(x) || !isFinite(y)) continue;
          points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        if (points.length < 3) return '';
        return `M${points.join(' L')}Z`;
      };
      try {
        if (feature.geometry.type === 'Polygon') {
          (feature.geometry.coordinates as number[][][]).forEach((ring) => {
            const p = processRing(ring);
            if (p) paths.push(p);
          });
        } else if (feature.geometry.type === 'MultiPolygon') {
          (feature.geometry.coordinates as number[][][][]).forEach((poly) => {
            poly.forEach((ring) => {
              const p = processRing(ring);
              if (p) paths.push(p);
            });
          });
        }
      } catch (err) {
        console.warn('Error processing feature:', feature.properties?.mundis_id, err);
        return '';
      }
      return paths.join(' ');
    },
    [projectCoords]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent" />
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Failed to load map data
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-auto bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl"
        style={{ minHeight: '400px' }}
        role="img"
        aria-label="District-level triple burden choropleth"
      >
        {geoData.features.map((feature, i) => {
          const burdenLevel = getBurdenLevel(feature, climateRiskType);
          const color = burdenLevel >= 0 ? burdenColors[burdenLevel] : '#f5f5f5';
          const path = featureToPath(feature);
          return (
            <path
              key={feature.properties.mundis_id || i}
              d={path}
              fill={color}
              stroke="#ffffff"
              strokeWidth={0.5}
              className="transition-all duration-200 hover:stroke-gray-800 hover:stroke-2 cursor-pointer"
              onMouseMove={(e) => {
                setHovered(feature);
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered === feature ? 1 : 0.9 }}
            />
          );
        })}
      </svg>

      {/* Horizontal legend strip below map */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
        <span className="font-medium text-gray-700 uppercase tracking-wide text-[10px]">
          Burden level
        </span>
        {[0, 1, 2, 3].map((level) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: burdenColors[level] }}
            />
            <span>{burdenLabels[level]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-200 bg-gray-200" />
          <span>No data</span>
        </div>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-white rounded-xl shadow-2xl p-4 max-w-xs pointer-events-none"
            style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
          >
            <div className="font-bold text-lg mb-1">
              {hovered.properties.nam2 || 'Unknown district'}
            </div>
            <div className="text-sm text-gray-500 mb-3">{hovered.properties.nam1 || ''}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Population</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(hovered.properties.popdist || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Burden</span>
                <span
                  className="font-medium px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      burdenColors[getBurdenLevel(hovered, climateRiskType)] || '#f5f5f5',
                    color: getBurdenLevel(hovered, climateRiskType) === 3 ? 'white' : 'inherit',
                  }}
                >
                  {burdenLabels[getBurdenLevel(hovered, climateRiskType)] || 'No data'}
                </span>
              </div>
              <div className="pt-2 mt-1 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Dimensions flagged</div>
                {getBurdenBreakdown(hovered, climateRiskType).map((d) => (
                  <div key={d.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                        d.active ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                      aria-hidden="true"
                    >
                      {d.active ? '✓' : '–'}
                    </span>
                    <span className={d.active ? 'font-medium text-gray-800' : 'text-gray-400'}>
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
              {hovered.properties.p365ln != null && (
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600">Poverty ($3.65)</span>
                  <span className="font-medium tabular-nums">
                    {hovered.properties.p365ln.toFixed(1)}%
                  </span>
                </div>
              )}
              {climateRiskType === 'flood' && hovered.properties.shpopfld != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{dimensionShortLabel('C', climateRiskType)}</span>
                  <span className="font-medium tabular-nums">
                    {hovered.properties.shpopfld.toFixed(1)}%
                  </span>
                </div>
              )}
              {hovered.properties.sewlat != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sewer/septic</span>
                  <span className="font-medium tabular-nums">
                    {hovered.properties.sewlat.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
