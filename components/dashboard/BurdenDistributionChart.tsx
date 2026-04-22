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
import {
  burdenColors,
  burdenLabels,
  COMBO_ORDER_AT_LEVEL,
  comboLabel,
  formatNumber,
} from './constants';
import type { ClimateRiskType, SummaryStats } from './types';

interface Props {
  stats: SummaryStats;
  climateRiskType: ClimateRiskType;
}

interface Row {
  level: number;
  levelLabel: string;
  percent: number;
  population: number;
  count: number;
  combos: Array<{ combo: string; label: string; percent: number; population: number }>;
}

interface TooltipPayload {
  payload: Row;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-sm mb-1" style={{ color: burdenColors[r.level] === '#ffcc80' ? '#b45309' : burdenColors[r.level] }}>
        {r.levelLabel}
      </div>
      <div className="text-gray-700">
        <span className="tabular-nums">{r.percent.toFixed(1)}%</span> of urban population
      </div>
      <div className="text-gray-500 tabular-nums">
        {formatNumber(r.population)} people · {r.count.toLocaleString()} districts
      </div>
      {r.combos.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
          {r.combos.map((c) => (
            <div key={c.combo} className="flex justify-between gap-4 text-[11px] text-gray-600">
              <span>{c.label}</span>
              <span className="tabular-nums">{c.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BurdenDistributionChart({ stats, climateRiskType }: Props) {
  const rows = useMemo<Row[]>(() => {
    const total = stats.totalPop;
    return [0, 1, 2, 3].map((level) => {
      const d = stats.distribution[level];
      const percent = total > 0 ? (d.population / total) * 100 : 0;
      const order = COMBO_ORDER_AT_LEVEL[level] ?? [];
      const combos = order
        .filter((c) => d.combos[c] && d.combos[c].population > 0)
        .map((c) => ({
          combo: c,
          label: comboLabel(c, climateRiskType),
          percent: total > 0 ? (d.combos[c].population / total) * 100 : 0,
          population: d.combos[c].population,
        }));
      return {
        level,
        levelLabel: burdenLabels[level],
        percent,
        population: d.population,
        count: d.count,
        combos,
      };
    });
  }, [stats, climateRiskType]);

  return (
    <div className="modern-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Burden distribution</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Share of urban population at each burden level
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="levelLabel"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
            {rows.map((r) => (
              <Cell key={r.level} fill={burdenColors[r.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {rows.map((r) => (
          <div key={r.level} className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: burdenColors[r.level] }}
              />
              <span className="text-gray-600">{r.levelLabel}</span>
            </div>
            <span className="font-semibold tabular-nums">
              {r.percent.toFixed(1)}%
            </span>
            <span className="text-[11px] text-gray-500 tabular-nums">
              {formatNumber(r.population)} people
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
