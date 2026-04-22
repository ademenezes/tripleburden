'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { geoOrthographic, geoPath, type GeoProjection, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { useCountries } from '@/components/shared/useCountries';
import { formatNumber, BASE_PATH } from '@/components/dashboard/constants';
import { numericToIso3 } from './isoMapping';
import type { ClimateRiskType, CountryStats } from '@/components/dashboard/types';

interface CountryFeatureProps {
  name?: string;
}

type CountryFeature = Feature<Geometry, CountryFeatureProps> & { id?: string | number };

const WIDTH = 640;
const HEIGHT = 640;
const ROTATION_SPEED = 0.08; // degrees per frame (~60fps)

// Band thresholds for choropleth colouring (TB share %).
const BANDS: Array<{ max: number; fill: string; label: string }> = [
  { max: 5, fill: '#fde68a', label: '< 5%' },
  { max: 15, fill: '#fcd34d', label: '5 – 15%' },
  { max: 30, fill: '#f59e0b', label: '15 – 30%' },
  { max: 50, fill: '#ea580c', label: '30 – 50%' },
  { max: 100, fill: '#c2410c', label: '≥ 50%' },
];

function bandFor(share: number | null): string {
  if (share == null || !isFinite(share)) return '#e5e7eb';
  for (const b of BANDS) if (share <= b.max) return b.fill;
  return BANDS[BANDS.length - 1].fill;
}

export default function GlobalTripleBurdenMap() {
  const { countries, loading } = useCountries();
  const [risk, setRisk] = useState<ClimateRiskType>('flood');
  const [rotation, setRotation] = useState<[number, number, number]>([20, -8, 0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoverIso, setHoverIso] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ x: number; y: number; lambda: number; phi: number } | null>(null);

  // Load + decode world topojson once.
  const worldFeatures = useMemo<CountryFeature[]>(() => {
    const topology = worldAtlas as unknown as Topology<{ countries: GeometryCollection }>;
    const fc = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, CountryFeatureProps>;
    return fc.features as CountryFeature[];
  }, []);

  // Country stats lookup by ISO3.
  const statsByIso3 = useMemo(() => {
    const map = new Map<string, CountryStats>();
    for (const c of countries) map.set(c.iso3.toUpperCase(), c);
    return map;
  }, [countries]);

  const shareFor = useMemo(() => {
    return (iso3: string | null) => {
      if (!iso3) return null;
      const c = statsByIso3.get(iso3);
      if (!c || !c.population) return null;
      const tb = risk === 'flood' ? c.pop_triple_burden_flood : c.pop_triple_burden_water_stress;
      return (tb / c.population) * 100;
    };
  }, [statsByIso3, risk]);

  // Auto-rotation loop.
  useEffect(() => {
    if (!autoRotate) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 16.67;
      last = now;
      setRotation(([lambda, phi, gamma]) => [lambda + ROTATION_SPEED * dt, phi, gamma]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoRotate]);

  // Projection + path builder — recompute when rotation changes.
  const projection = useMemo<GeoProjection>(() => {
    return geoOrthographic()
      .scale(HEIGHT / 2 - 4)
      .translate([WIDTH / 2, HEIGHT / 2])
      .rotate(rotation)
      .clipAngle(90);
  }, [rotation]);

  const pathFn = useMemo(() => geoPath(projection), [projection]);

  const hoverCountry = hoverIso ? statsByIso3.get(hoverIso) : null;
  const hoverShare = hoverCountry ? shareFor(hoverCountry.iso3.toUpperCase()) : null;
  const hoverTb = hoverCountry
    ? risk === 'flood'
      ? hoverCountry.pop_triple_burden_flood
      : hoverCountry.pop_triple_burden_water_stress
    : 0;

  // Drag to rotate.
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setAutoRotate(false);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      lambda: rotation[0],
      phi: rotation[1],
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotation([
      dragRef.current.lambda + dx * 0.25,
      Math.max(-75, Math.min(75, dragRef.current.phi - dy * 0.25)),
      0,
    ]);
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
        {/* Left rail */}
        <div className="w-full md:w-[260px] flex-shrink-0 md:pt-4">
          <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-300/90 mb-3">
            Global map
          </div>
          <h3 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-4">
            Where the burden lands
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Share of urban population in triple-burdened districts, by country. Drag the globe or
            hover a country to inspect; click to open its full profile.
          </p>
          <ClimateRiskToggleDark value={risk} onChange={setRisk} />
          <div className="mt-6 space-y-1.5">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50">
              Scale
            </div>
            {BANDS.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-xs text-white/75">
                <span className="w-4 h-3 rounded-sm" style={{ backgroundColor: b.fill }} />
                <span className="tabular-nums">{b.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-white/50 pt-0.5">
              <span className="w-4 h-3 rounded-sm bg-white/10 border border-white/20" />
              <span>No data</span>
            </div>
          </div>
        </div>

        {/* Globe */}
        <div className="flex-1 w-full relative">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-300/50 border-t-transparent" />
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full h-auto select-none cursor-grab active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={() => {
                dragRef.current = null;
                setHoverIso(null);
                setMousePos(null);
              }}
              role="img"
              aria-label="Rotating globe showing triple-burden share by country"
            >
              <defs>
                <radialGradient id="sphere-gradient" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#1e5f6a" />
                  <stop offset="100%" stopColor="#062b30" />
                </radialGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.35" />
                </radialGradient>
              </defs>

              {/* Subtle outer glow */}
              <circle
                cx={WIDTH / 2}
                cy={HEIGHT / 2}
                r={HEIGHT / 2}
                fill="url(#glow)"
              />
              {/* Sphere */}
              <circle
                cx={WIDTH / 2}
                cy={HEIGHT / 2}
                r={HEIGHT / 2 - 4}
                fill="url(#sphere-gradient)"
              />
              {/* Graticule feel — equator + prime meridian arcs for texture */}
              <circle
                cx={WIDTH / 2}
                cy={HEIGHT / 2}
                r={HEIGHT / 2 - 4}
                fill="none"
                stroke="#ffffff"
                strokeOpacity={0.05}
                strokeWidth={1}
              />

              {/* Countries */}
              {worldFeatures.map((f, i) => {
                const iso3 = numericToIso3(f.id);
                const share = shareFor(iso3);
                const d = pathFn(f as GeoPermissibleObjects);
                if (!d) return null;
                const isHover = iso3 === hoverIso;
                return (
                  <path
                    key={`c-${i}`}
                    d={d}
                    fill={bandFor(share)}
                    stroke={isHover ? '#fff' : '#062b30'}
                    strokeWidth={isHover ? 1.2 : 0.4}
                    opacity={share == null ? 0.55 : 1}
                    onMouseEnter={() => setHoverIso(iso3)}
                    onMouseLeave={() => setHoverIso((prev) => (prev === iso3 ? null : prev))}
                    style={iso3 && share != null ? { cursor: 'pointer' } : undefined}
                    onClick={() => {
                      if (iso3 && statsByIso3.has(iso3)) {
                        window.location.href = `${BASE_PATH}/dashboard?country=${iso3}`;
                      }
                    }}
                  />
                );
              })}
            </svg>
          )}

          {/* Tooltip */}
          {hoverCountry && mousePos && (
            <div
              className="pointer-events-none fixed z-50 bg-white text-gray-900 rounded-xl shadow-2xl px-4 py-3 text-sm min-w-[200px]"
              style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}
            >
              <div className="font-bold text-base mb-1">{hoverCountry.name}</div>
              <div className="flex justify-between gap-4 tabular-nums">
                <span className="text-gray-500">Triple-burdened</span>
                <span className="font-semibold text-[var(--accent-danger)]">
                  {hoverShare != null ? `${hoverShare.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4 tabular-nums text-xs text-gray-500">
                <span>{formatNumber(hoverTb)} people</span>
                <span>/ {formatNumber(hoverCountry.population)}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                Click to open profile <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-xs text-white/60">
            <div>Drag to rotate · Hover a country · Click to open profile</div>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium transition-colors"
            >
              {autoRotate ? 'Pause rotation' : 'Resume rotation'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-white/70 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[#062b30] font-semibold rounded-lg bg-amber-300 hover:bg-amber-200 transition-colors"
        >
          Browse all countries in the dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// A tight dark-mode-compatible scenario toggle — styled for the dark hero.
function ClimateRiskToggleDark({
  value,
  onChange,
}: {
  value: ClimateRiskType;
  onChange: (v: ClimateRiskType) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50 mb-2">
        Scenario
      </div>
      <div className="flex bg-white/10 rounded-xl p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={value === 'flood'}
          onClick={() => onChange('flood')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            value === 'flood'
              ? 'bg-amber-300 text-[#062b30] shadow'
              : 'text-white/75 hover:text-white'
          }`}
        >
          Flood risk
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={value === 'water_stress'}
          onClick={() => onChange('water_stress')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            value === 'water_stress'
              ? 'bg-amber-300 text-[#062b30] shadow'
              : 'text-white/75 hover:text-white'
          }`}
        >
          Water stress
        </button>
      </div>
    </div>
  );
}

