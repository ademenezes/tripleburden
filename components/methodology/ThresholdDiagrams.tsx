'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BASE_PATH, THRESHOLDS } from '@/components/dashboard/constants';
import type { DistrictFeature, GeoJSONData } from '@/components/dashboard/types';

type BinRow = { bin: string; x: number; count: number };

interface Props {
  sampleCountries?: string[];
  sampleLabel?: string;
}

function buildHistogram(
  values: number[],
  bins: number,
  domain: [number, number]
): BinRow[] {
  const [min, max] = domain;
  const width = (max - min) / bins;
  const rows: BinRow[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = min + i * width;
    const hi = lo + width;
    rows.push({ bin: `${Math.round(lo)}–${Math.round(hi)}`, x: lo + width / 2, count: 0 });
  }
  for (const v of values) {
    if (!isFinite(v)) continue;
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    rows[idx].count++;
  }
  return rows;
}

interface TooltipPayload {
  payload: BinRow;
}

function HistogramTooltip({ active, payload, suffix = '%' }: {
  active?: boolean;
  payload?: TooltipPayload[];
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white/95 border border-gray-200 rounded-lg shadow-sm px-2 py-1 text-xs">
      <div className="tabular-nums">
        {p.bin}
        {suffix}
      </div>
      <div className="text-gray-600 tabular-nums">{p.count} districts</div>
    </div>
  );
}

export default function ThresholdDiagrams({
  sampleCountries = ['bgd', 'nga', 'phl'],
  sampleLabel = 'Bangladesh · Nigeria · Philippines',
}: Props) {
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      sampleCountries.map((iso) =>
        fetch(`${BASE_PATH}/data/districts/${iso}.json`).then((r) => r.json() as Promise<GeoJSONData>)
      )
    )
      .then((datasets) => {
        if (cancelled) return;
        const combined: DistrictFeature[] = [];
        for (const d of datasets) combined.push(...(d.features ?? []));
        setFeatures(combined);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sampleCountries]);

  const { povHist, floodHist, sanHist } = useMemo(() => {
    const pov: number[] = [];
    const flood: number[] = [];
    const san: number[] = [];
    for (const f of features) {
      const p = f.properties;
      if (typeof p.p365ln === 'number' && isFinite(p.p365ln)) pov.push(p.p365ln);
      if (typeof p.shpopfld === 'number' && isFinite(p.shpopfld)) flood.push(p.shpopfld);
      if (typeof p.sewlat === 'number' && isFinite(p.sewlat)) san.push(p.sewlat);
    }
    return {
      povHist: buildHistogram(pov, 15, [0, 100]),
      floodHist: buildHistogram(flood, 15, [0, 100]),
      sanHist: buildHistogram(san, 15, [0, 100]),
    };
  }, [features]);

  if (error) {
    return (
      <div className="modern-card p-6 text-sm text-gray-500">
        Could not load sample district data for threshold diagrams.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="modern-card p-6 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--climate-teal)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-500">
        Sample: <strong>{sampleLabel}</strong> — {features.length.toLocaleString()} districts
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Poverty */}
        <div className="modern-card p-5">
          <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--poverty-earth)' }}>
            Poverty rate ($3.65/day)
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            Dashed line: {THRESHOLDS.povertyPct}% threshold
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={povHist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="povGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--poverty-earth)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--poverty-earth)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
              />
              <YAxis hide />
              <Tooltip content={<HistogramTooltip />} cursor={{ stroke: '#ccc' }} />
              <ReferenceLine
                x={THRESHOLDS.povertyPct}
                stroke="var(--poverty-earth)"
                strokeDasharray="4 3"
                strokeOpacity={0.85}
              />
              <Area
                dataKey="count"
                stroke="var(--poverty-earth)"
                strokeWidth={2}
                fill="url(#povGrad)"
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Flood */}
        <div className="modern-card p-5">
          <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--climate-teal)' }}>
            Flood risk (% pop. at risk)
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            Dashed line: {THRESHOLDS.floodPct}% threshold
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={floodHist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
              />
              <YAxis hide />
              <Tooltip content={<HistogramTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <ReferenceLine
                x={THRESHOLDS.floodPct}
                stroke="var(--climate-teal)"
                strokeDasharray="4 3"
                strokeOpacity={0.85}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {floodHist.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.x >= THRESHOLDS.floodPct ? 'var(--climate-teal)' : 'rgba(26, 127, 142, 0.35)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sanitation */}
        <div className="modern-card p-5">
          <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--sanitation-blue)' }}>
            Sewer/septic access (%)
          </h4>
          <p className="text-[11px] text-gray-500 mb-3">
            Dashed line: {THRESHOLDS.sanitationPct}% threshold
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sanHist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
                unit="%"
              />
              <YAxis hide />
              <Tooltip content={<HistogramTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <ReferenceLine
                x={THRESHOLDS.sanitationPct}
                stroke="var(--sanitation-blue)"
                strokeDasharray="4 3"
                strokeOpacity={0.85}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {sanHist.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.x < THRESHOLDS.sanitationPct ? 'var(--sanitation-blue)' : 'rgba(30, 58, 95, 0.35)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
