'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REGION_ORDER, regionLabels, formatNumber } from './constants';
import type { ClimateRiskType, CountryStats } from './types';

interface Props {
  countries: CountryStats[];
  climateRiskType: ClimateRiskType;
  onRegionClick?: (region: string) => void;
  title?: string;
  subtitle?: string;
}

interface Row {
  code: string;
  label: string;
  share: number;
  tbPop: number;
  totalPop: number;
}

interface TooltipPayload {
  payload: Row;
}

function RegionTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-1 text-gray-900">{r.label}</div>
      <div className="tabular-nums text-[var(--accent-danger)]">
        {r.share.toFixed(1)}% triple-burdened
      </div>
      <div className="text-gray-500 tabular-nums">
        {formatNumber(r.tbPop)} of {formatNumber(r.totalPop)} urban pop.
      </div>
    </div>
  );
}

export default function RegionalAggregateChart({
  countries,
  climateRiskType,
  onRegionClick,
  title = 'Triple burden by region',
  subtitle,
}: Props) {
  const data = useMemo<Row[]>(() => {
    const totals: Record<string, { tb: number; pop: number }> = {};
    for (const c of countries) {
      if (!c.region) continue;
      const tb =
        climateRiskType === 'flood'
          ? c.pop_triple_burden_flood
          : c.pop_triple_burden_water_stress;
      if (!totals[c.region]) totals[c.region] = { tb: 0, pop: 0 };
      totals[c.region].tb += tb ?? 0;
      totals[c.region].pop += c.population ?? 0;
    }
    const rows: Row[] = REGION_ORDER.map((code) => ({
      code,
      label: regionLabels[code] ?? code,
      share: totals[code] && totals[code].pop > 0 ? (totals[code].tb / totals[code].pop) * 100 : 0,
      tbPop: totals[code]?.tb ?? 0,
      totalPop: totals[code]?.pop ?? 0,
    })).sort((a, b) => b.share - a.share);
    return rows;
  }, [countries, climateRiskType]);

  return (
    <div className="modern-card p-6">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-xs text-gray-500">
          {climateRiskType === 'flood' ? 'Flood scenario' : 'Water-stress scenario'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
          <XAxis
            type="number"
            unit="%"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={170}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<RegionTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar
            dataKey="share"
            radius={[0, 6, 6, 0]}
            onClick={onRegionClick ? (d) => onRegionClick((d as unknown as Row).code) : undefined}
            style={onRegionClick ? { cursor: 'pointer' } : undefined}
          >
            {data.map((r, i) => {
              const intensity = Math.min(1, r.share / 45);
              const base = [26, 127, 142];
              const dark = [15, 90, 102];
              const c = base.map((v, k) => Math.round(v + (dark[k] - v) * intensity));
              return <Cell key={i} fill={`rgb(${c[0]},${c[1]},${c[2]})`} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
