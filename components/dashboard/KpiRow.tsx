'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatNumber, tbShareBand } from './constants';
import type { ClimateRiskType, CountryStats } from './types';

interface Props {
  country: CountryStats;
  climateRiskType: ClimateRiskType;
  tripleBurdenDistricts: number;
}

const BAND_STYLES: Record<'low' | 'mid' | 'high', { text: string; bg: string; label: string }> = {
  low: {
    text: 'text-[var(--accent-success)]',
    bg: 'bg-[var(--accent-success-soft)]',
    label: 'Lower than regional avg',
  },
  mid: {
    text: 'text-[var(--accent-warning)]',
    bg: 'bg-[var(--accent-warning-soft)]',
    label: 'Moderate exposure',
  },
  high: {
    text: 'text-[var(--accent-danger)]',
    bg: 'bg-[var(--accent-danger-soft)]',
    label: 'Severely exposed',
  },
};

export default function KpiRow({ country, climateRiskType, tripleBurdenDistricts }: Props) {
  const tbPop =
    climateRiskType === 'flood'
      ? country.pop_triple_burden_flood
      : country.pop_triple_burden_water_stress;
  const share = country.population > 0 ? (tbPop / country.population) * 100 : 0;
  const band = tbShareBand(share);

  const cards = [
    {
      icon: MapPin,
      label: 'Districts',
      sub: 'Urban ADM2 units',
      value: country.districts.toLocaleString(),
      accentClass: 'text-[var(--climate-teal)]',
      iconBg: 'bg-[var(--climate-teal)]/10',
    },
    {
      icon: Users,
      label: 'Urban population',
      sub: 'Total covered',
      value: formatNumber(country.population),
      accentClass: 'text-[var(--sanitation-blue)]',
      iconBg: 'bg-[var(--sanitation-blue)]/10',
    },
    {
      icon: AlertTriangle,
      label: 'Triple-burdened pop.',
      sub: `${tripleBurdenDistricts.toLocaleString()} districts at burden 3`,
      value: formatNumber(tbPop),
      accentClass: 'text-[var(--accent-danger)]',
      iconBg: 'bg-[var(--accent-danger-soft)]',
    },
    {
      icon: TrendingUp,
      label: 'Share of urban pop.',
      sub: BAND_STYLES[band].label,
      value: `${share.toFixed(1)}%`,
      accentClass: BAND_STYLES[band].text,
      iconBg: BAND_STYLES[band].bg,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="modern-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.iconBg}`}>
                <Icon className={`w-4 h-4 ${c.accentClass}`} />
              </div>
            </div>
            <div className={`text-3xl md:text-4xl font-bold tabular-nums ${c.accentClass}`}>
              {c.value}
            </div>
            <div className="text-xs text-gray-500 mt-1.5 min-h-[1em]">{c.sub}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
