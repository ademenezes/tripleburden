'use client';

import { useMemo } from 'react';
import { TrendingDown, Droplets, Home } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { THRESHOLDS } from './constants';
import type { ClimateRiskType, CountryStats, DistrictFeature, GeoJSONData } from './types';

interface Props {
  country: CountryStats;
  geoData: GeoJSONData;
  climateRiskType: ClimateRiskType;
}

type BinRow = { bin: string; x: number; count: number; threshold?: boolean };

function histogram(values: number[], bins: number, domain: [number, number]): BinRow[] {
  const [min, max] = domain;
  const width = (max - min) / bins;
  const rows: BinRow[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = min + i * width;
    const hi = lo + width;
    rows.push({
      bin: `${Math.round(lo)}–${Math.round(hi)}`,
      x: lo,
      count: 0,
    });
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

function pickPovertyMetric(country: CountryStats): {
  key: 'p215ln' | 'p365ln' | 'p685ln';
  label: string;
} {
  if (country.income_group === '4_LIC') return { key: 'p215ln', label: 'Poverty at $2.15/day' };
  if (country.income_group === '1_HIC') return { key: 'p685ln', label: 'Poverty at $6.85/day' };
  return { key: 'p365ln', label: 'Poverty at $3.65/day' };
}

interface TooltipPayload {
  payload: BinRow;
}

function MiniTooltip({ active, payload, suffix = '%' }: {
  active?: boolean;
  payload?: TooltipPayload[];
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white/95 border border-gray-200 rounded-lg shadow-sm px-2 py-1 text-xs">
      <div className="tabular-nums">{p.bin}{suffix}</div>
      <div className="text-gray-600">{p.count} districts</div>
    </div>
  );
}

interface CardProps {
  icon: React.ComponentType<{ className?: string }>;
  accentVar: string;
  accentSoftBg: string;
  title: string;
  flagged: number;
  total: number;
  metricLabel: string;
  children: React.ReactNode;
}

function DimCard({ icon: Icon, accentVar, accentSoftBg, title, flagged, total, metricLabel, children }: CardProps) {
  const pct = total > 0 ? (flagged / total) * 100 : 0;
  return (
    <div className="modern-card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${accentSoftBg}`} style={{ color: accentVar }}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold tabular-nums" style={{ color: accentVar }}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-xs text-gray-500">of districts flagged</span>
      </div>
      <div className="text-xs text-gray-500 tabular-nums mb-4">
        {flagged.toLocaleString()} of {total.toLocaleString()} districts
      </div>
      <div className="mt-auto">
        <div className="text-[11px] text-gray-500 mb-1">{metricLabel}</div>
        {children}
      </div>
    </div>
  );
}

export default function DimensionBreakdown({ country, geoData, climateRiskType }: Props) {
  const poverty = pickPovertyMetric(country);

  const data = useMemo(() => {
    const features = geoData.features;
    const total = features.length;
    let povFlag = 0;
    let climFlag = 0;
    let sanFlag = 0;
    const povVals: number[] = [];
    const floodVals: number[] = [];
    const bwsCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sanVals: number[] = [];

    for (const f of features) {
      const p = f.properties;
      if (p.d_pov === 1) povFlag++;
      if (p.d_lowsan === 1) sanFlag++;
      const climateFlag = climateRiskType === 'flood' ? p.d_fld : p.d_wtrstr;
      if (climateFlag === 1) climFlag++;

      const pv = p[poverty.key];
      if (typeof pv === 'number' && isFinite(pv)) povVals.push(pv);

      if (typeof p.shpopfld === 'number' && isFinite(p.shpopfld)) floodVals.push(p.shpopfld);
      if (p.bws_cat != null && p.bws_cat >= 1 && p.bws_cat <= 5) {
        bwsCounts[p.bws_cat] = (bwsCounts[p.bws_cat] ?? 0) + 1;
      }
      if (typeof p.sewlat === 'number' && isFinite(p.sewlat)) sanVals.push(p.sewlat);
    }

    return {
      total,
      povFlag,
      climFlag,
      sanFlag,
      povHist: histogram(povVals, 10, [0, 100]),
      floodHist: histogram(floodVals, 10, [0, 100]),
      bwsData: [1, 2, 3, 4, 5].map((c) => ({
        bin: String(c),
        x: c,
        count: bwsCounts[c] ?? 0,
        threshold: c >= THRESHOLDS.waterStressCatMin,
      })) as BinRow[],
      sanHist: histogram(sanVals, 10, [0, 100]),
    };
  }, [geoData, climateRiskType, poverty.key]);

  const povertyColor = 'var(--poverty-earth)';
  const climateColor = 'var(--climate-teal)';
  const sanitationColor = 'var(--sanitation-blue)';

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <DimCard
        icon={TrendingDown}
        accentVar={povertyColor}
        accentSoftBg="bg-[var(--poverty-earth)]/10"
        title="Poverty"
        flagged={data.povFlag}
        total={data.total}
        metricLabel={`${poverty.label} (% of population)`}
      >
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={data.povHist} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
            <XAxis dataKey="x" hide type="number" domain={[0, 100]} />
            <YAxis hide />
            <Tooltip content={<MiniTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine
              x={THRESHOLDS.povertyPct}
              stroke={povertyColor}
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <Bar dataKey="count" fill={povertyColor} radius={[3, 3, 0, 0]}>
              {data.povHist.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    data.povHist[i].x >= THRESHOLDS.povertyPct
                      ? povertyColor
                      : 'rgba(139, 115, 85, 0.35)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-gray-400 mt-1">
          Dashed line = {THRESHOLDS.povertyPct}% threshold
        </div>
      </DimCard>

      <DimCard
        icon={Droplets}
        accentVar={climateColor}
        accentSoftBg="bg-[var(--climate-teal)]/10"
        title={climateRiskType === 'flood' ? 'Flood risk' : 'Water stress'}
        flagged={data.climFlag}
        total={data.total}
        metricLabel={
          climateRiskType === 'flood'
            ? 'Population at flood risk (%)'
            : 'Water-stress category (1–5, Aqueduct)'
        }
      >
        {climateRiskType === 'flood' ? (
          <>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={data.floodHist} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="x" hide type="number" domain={[0, 100]} />
                <YAxis hide />
                <Tooltip content={<MiniTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <ReferenceLine
                  x={THRESHOLDS.floodPct}
                  stroke={climateColor}
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                />
                <Bar dataKey="count" fill={climateColor} radius={[3, 3, 0, 0]}>
                  {data.floodHist.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        data.floodHist[i].x >= THRESHOLDS.floodPct
                          ? climateColor
                          : 'rgba(26, 127, 142, 0.35)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-gray-400 mt-1">
              Dashed line = {THRESHOLDS.floodPct}% threshold
            </div>
          </>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={data.bwsData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="bin" hide />
                <YAxis hide />
                <Tooltip content={<MiniTooltip suffix="" />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {data.bwsData.map((row, i) => (
                    <Cell
                      key={i}
                      fill={row.threshold ? climateColor : 'rgba(26, 127, 142, 0.35)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-gray-400 mt-1">
              Categories ≥ {THRESHOLDS.waterStressCatMin} flagged as stressed
            </div>
          </>
        )}
      </DimCard>

      <DimCard
        icon={Home}
        accentVar={sanitationColor}
        accentSoftBg="bg-[var(--sanitation-blue)]/10"
        title="Low sanitation"
        flagged={data.sanFlag}
        total={data.total}
        metricLabel="Sewer/septic access (%)"
      >
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={data.sanHist} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
            <XAxis dataKey="x" hide type="number" domain={[0, 100]} />
            <YAxis hide />
            <Tooltip content={<MiniTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine
              x={THRESHOLDS.sanitationPct}
              stroke={sanitationColor}
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <Bar dataKey="count" fill={sanitationColor} radius={[3, 3, 0, 0]}>
              {data.sanHist.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    data.sanHist[i].x < THRESHOLDS.sanitationPct
                      ? sanitationColor
                      : 'rgba(30, 58, 95, 0.35)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-gray-400 mt-1">
          Districts below {THRESHOLDS.sanitationPct}% are flagged
        </div>
      </DimCard>
    </div>
  );
}
