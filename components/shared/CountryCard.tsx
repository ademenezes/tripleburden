'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  burdenColors,
  formatNumber,
  regionLabels,
  incomeGroupLabels,
} from '../dashboard/constants';
import type { ClimateRiskType, CountryStats } from '../dashboard/types';

interface Props {
  country: CountryStats;
  climateRiskType: ClimateRiskType;
  rank?: number;
  narrative?: string;
  onClick?: (country: CountryStats) => void;
  href?: string;
  variant?: 'compact' | 'full';
}

export default function CountryCard({
  country,
  climateRiskType,
  rank,
  narrative,
  onClick,
  href,
  variant = 'compact',
}: Props) {
  const tbPop =
    climateRiskType === 'flood'
      ? country.pop_triple_burden_flood
      : country.pop_triple_burden_water_stress;
  const share = country.population > 0 ? (tbPop / country.population) * 100 : 0;

  const dist =
    climateRiskType === 'flood'
      ? country.burden_distribution_flood
      : country.burden_distribution_water_stress;
  const total =
    (dist?.['0'] ?? 0) + (dist?.['1'] ?? 0) + (dist?.['2'] ?? 0) + (dist?.['3'] ?? 0);
  const segments: Array<{ level: 0 | 1 | 2 | 3; pct: number }> = [0, 1, 2, 3].map((level) => ({
    level: level as 0 | 1 | 2 | 3,
    pct: total > 0 ? ((dist?.[String(level)] ?? 0) / total) * 100 : 0,
  }));

  const content = (
    <div className="modern-card p-5 h-full flex flex-col text-left transition-shadow hover:shadow-xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {rank !== undefined && (
            <div className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1">
              #{rank}
            </div>
          )}
          <div className="text-lg font-bold text-gray-900 truncate">{country.name}</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {country.region && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--climate-teal)]/10 text-[var(--climate-teal)] font-medium">
                {regionLabels[country.region] ?? country.region}
              </span>
            )}
            {country.income_group && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--sanitation-blue)]/10 text-[var(--sanitation-blue)] font-medium">
                {incomeGroupLabels[country.income_group] ?? country.income_group}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold tabular-nums text-[var(--accent-danger)]">
          {share.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-500">triple-burdened</span>
      </div>

      <div className="h-2 w-full rounded-full overflow-hidden flex bg-gray-100">
        {segments.map((s) =>
          s.pct > 0 ? (
            <div
              key={s.level}
              style={{
                width: `${s.pct}%`,
                backgroundColor: burdenColors[s.level],
              }}
              title={`Level ${s.level}: ${s.pct.toFixed(1)}%`}
            />
          ) : null
        )}
      </div>

      <div className="mt-3 text-[11px] text-gray-500 tabular-nums">
        {formatNumber(tbPop)} of {formatNumber(country.population)} urban pop.
        {' · '}
        {country.districts.toLocaleString()} districts
      </div>

      {variant === 'full' && narrative && (
        <p className="text-sm text-gray-600 mt-4 leading-relaxed">{narrative}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(country)} className="block w-full h-full">
        {content}
      </button>
    );
  }
  return content;
}
