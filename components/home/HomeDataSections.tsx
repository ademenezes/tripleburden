'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import RegionalAggregateChart from '@/components/dashboard/RegionalAggregateChart';
import ClimateRiskToggle from '@/components/dashboard/ClimateRiskToggle';
import { useCountries } from '@/components/shared/useCountries';
import {
  formatNumber,
  INCOME_GROUP_ORDER,
  incomeGroupLabels,
} from '@/components/dashboard/constants';
import type { ClimateRiskType, CountryStats } from '@/components/dashboard/types';

function Loading({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--climate-teal)] border-t-transparent" />
    </div>
  );
}

function computeIncomeBreakdown(countries: CountryStats[], risk: ClimateRiskType) {
  const totals: Record<string, number> = {};
  for (const c of countries) {
    const key = c.income_group ?? 'other';
    const tb = risk === 'flood' ? c.pop_triple_burden_flood : c.pop_triple_burden_water_stress;
    totals[key] = (totals[key] ?? 0) + (tb ?? 0);
  }
  return INCOME_GROUP_ORDER.filter((k) => totals[k] && totals[k] > 0).map((k) => ({
    key: k,
    label: incomeGroupLabels[k] ?? k,
    value: totals[k],
  }));
}

const INCOME_COLORS: Record<string, string> = {
  '4_LIC': 'var(--poverty-earth)',
  '3_LMIC': 'var(--poverty-earth-light)',
  '2_UMIC': 'var(--climate-teal-light)',
  '1_HIC': 'var(--climate-teal)',
};

interface ScenarioComparisonRow {
  label: string;
  flood: number;
  water: number;
}

interface GenericTooltipPayload {
  color?: string;
  dataKey?: string | number;
  name?: string;
  value?: number;
  payload?: ScenarioComparisonRow;
}

function ScenarioTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: GenericTooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-700">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="tabular-nums ml-auto">{formatNumber(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomeDataSections() {
  const { countries, loading } = useCountries();
  const [risk, setRisk] = useState<ClimateRiskType>('flood');

  const incomeRows = useMemo(() => computeIncomeBreakdown(countries, risk), [countries, risk]);

  const scenarioRows = useMemo<ScenarioComparisonRow[]>(() => {
    const regions: Record<string, { flood: number; water: number }> = {};
    for (const c of countries) {
      if (!c.region) continue;
      if (!regions[c.region]) regions[c.region] = { flood: 0, water: 0 };
      regions[c.region].flood += c.pop_triple_burden_flood ?? 0;
      regions[c.region].water += c.pop_triple_burden_water_stress ?? 0;
    }
    return Object.entries(regions)
      .map(([code, v]) => ({ label: code, flood: v.flood, water: v.water }))
      .sort((a, b) => b.flood + b.water - (a.flood + a.water));
  }, [countries]);

  if (loading) {
    return (
      <div className="py-20">
        <Loading height="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <ClimateRiskToggle value={risk} onChange={setRisk} label="Scenario" />
        </div>
      </div>

      <RegionalAggregateChart
        countries={countries}
        climateRiskType={risk}
        title="Triple burden by region"
        subtitle="Share of urban population in districts facing all three burdens"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="modern-card p-6">
          <h3 className="text-lg font-bold">Triple-burdened population by income group</h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">
            Lower-income countries carry the bulk of the burden
          </p>
          {incomeRows.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={incomeRows}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={1}
                >
                  {incomeRows.map((r) => (
                    <Cell key={r.key} fill={INCOME_COLORS[r.key] ?? '#ccc'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value))}
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {incomeRows.map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: INCOME_COLORS[r.key] ?? '#ccc' }}
                />
                <span className="text-gray-600 truncate">{r.label}</span>
                <span className="ml-auto tabular-nums font-medium">{formatNumber(r.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modern-card p-6">
          <h3 className="text-lg font-bold">Flood vs. water-stress scenarios</h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">
            Triple-burdened population by region, both climate drivers
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scenarioRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v)}
                width={44}
              />
              <Tooltip content={<ScenarioTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="flood" name="Flood" fill="var(--sanitation-blue)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="water" name="Water stress" fill="var(--climate-teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
