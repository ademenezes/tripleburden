'use client';

import { Sparkles } from 'lucide-react';
import { CLIMATE_RISK_LABELS, formatNumber } from './constants';
import type { ClimateRiskType, CountryStats, SummaryStats } from './types';

interface Props {
  country: CountryStats;
  stats: SummaryStats;
  climateRiskType: ClimateRiskType;
}

const DIMENSION_TEXT: Record<'P' | 'C' | 'S', (risk: ClimateRiskType) => string> = {
  P: () => 'Poverty',
  C: (r) => CLIMATE_RISK_LABELS[r],
  S: () => 'Low sanitation',
};

export default function KeyFindings({ country, stats, climateRiskType }: Props) {
  const tbPop =
    climateRiskType === 'flood'
      ? country.pop_triple_burden_flood
      : country.pop_triple_burden_water_stress;
  const share = country.population > 0 ? (tbPop / country.population) * 100 : 0;
  const tbDistricts = stats.distribution[3]?.count ?? 0;
  const scenario = climateRiskType === 'flood' ? 'flood-risk' : 'water-stress';
  const dim = stats.dominantDimension ? DIMENSION_TEXT[stats.dominantDimension](climateRiskType) : null;

  return (
    <div className="modern-card p-6 md:p-7 flex items-start gap-4 bg-gradient-to-br from-white via-white to-teal-50/40">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--climate-teal)] to-[var(--sanitation-blue)] text-white shadow-sm flex-shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 mb-1.5">
          Key findings
        </div>
        <p className="text-base md:text-lg text-gray-800 leading-relaxed">
          In <strong>{country.name}</strong>, about{' '}
          <strong className="text-[var(--accent-danger)] tabular-nums">
            {share.toFixed(1)}%
          </strong>{' '}
          of the urban population (
          <span className="tabular-nums">{formatNumber(tbPop)}</span> people) live in districts
          facing all three burdens under the {scenario} scenario.{' '}
          {tbDistricts > 0 && (
            <>
              <strong className="tabular-nums">{tbDistricts.toLocaleString()}</strong> districts are
              triple-burdened
              {stats.dominantRegion ? (
                <>
                  {' '}
                  — concentrated in <strong>{stats.dominantRegion}</strong>
                </>
              ) : (
                ''
              )}
              .{' '}
            </>
          )}
          {dim && (
            <>
              <strong>{dim}</strong> is the most widespread single risk across districts.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
