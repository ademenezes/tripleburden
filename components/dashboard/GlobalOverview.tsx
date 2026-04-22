'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Droplets } from 'lucide-react';
import { formatNumber } from './constants';
import RegionalAggregateChart from './RegionalAggregateChart';
import CountryCard from '../shared/CountryCard';
import type { ClimateRiskType, CountryStats } from './types';

interface Props {
  countries: CountryStats[];
  climateRiskType: ClimateRiskType;
  onSelectCountry: (c: CountryStats) => void;
}

export default function GlobalOverview({ countries, climateRiskType, onSelectCountry }: Props) {
  const top = useMemo(() => {
    const withShare = countries
      .filter((c) => c.population >= 500_000)
      .map((c) => {
        const tb =
          climateRiskType === 'flood'
            ? c.pop_triple_burden_flood
            : c.pop_triple_burden_water_stress;
        return {
          country: c,
          tb,
          share: c.population > 0 ? (tb / c.population) * 100 : 0,
        };
      })
      .filter((r) => r.share > 0)
      .sort((a, b) => b.share - a.share)
      .slice(0, 10);
    return withShare;
  }, [countries, climateRiskType]);

  const globalTotals = useMemo(() => {
    let pop = 0;
    let tbFlood = 0;
    let tbWater = 0;
    for (const c of countries) {
      pop += c.population ?? 0;
      tbFlood += c.pop_triple_burden_flood ?? 0;
      tbWater += c.pop_triple_burden_water_stress ?? 0;
    }
    return { pop, tbFlood, tbWater };
  }, [countries]);

  const tbNow = climateRiskType === 'flood' ? globalTotals.tbFlood : globalTotals.tbWater;
  const globalShare = globalTotals.pop > 0 ? (tbNow / globalTotals.pop) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Global headline numbers */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-6"
        >
          <div className="flex items-center gap-2 text-[var(--climate-teal)] mb-3">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Urban population covered
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--climate-teal)]">
            {formatNumber(globalTotals.pop)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Across {countries.length.toLocaleString()} countries
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="modern-card p-6"
        >
          <div className="flex items-center gap-2 text-[var(--accent-danger)] mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Triple-burdened ({climateRiskType === 'flood' ? 'flood' : 'water stress'})
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--accent-danger)]">
            {formatNumber(tbNow)}
          </div>
          <div className="text-xs text-gray-500 mt-2 tabular-nums">
            {globalShare.toFixed(1)}% of urban population
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="modern-card p-6"
        >
          <div className="flex items-center gap-2 text-[var(--sanitation-blue)] mb-3">
            <Droplets className="w-4 h-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Countries with triple-burdened districts
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--sanitation-blue)]">
            {
              countries.filter((c) => {
                const tb =
                  climateRiskType === 'flood'
                    ? c.pop_triple_burden_flood
                    : c.pop_triple_burden_water_stress;
                return (tb ?? 0) > 0;
              }).length
            }
          </div>
          <div className="text-xs text-gray-500 mt-2">
            With at least one burden-3 district
          </div>
        </motion.div>
      </div>

      {/* Regional chart */}
      <RegionalAggregateChart
        countries={countries}
        climateRiskType={climateRiskType}
        subtitle="Click through to a country card below to drill in"
      />

      {/* Top 10 countries */}
      <div>
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-bold">Top 10 countries by triple-burden share</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Countries ≥ 500K urban population, ranked by % of population in burden-3 districts
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {top.map((r, i) => (
            <CountryCard
              key={r.country.iso3}
              country={r.country}
              climateRiskType={climateRiskType}
              rank={i + 1}
              onClick={onSelectCountry}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Or browse all {countries.length} countries using the selector above.
        </p>
      </div>
    </div>
  );
}
