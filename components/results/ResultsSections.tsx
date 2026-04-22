'use client';

import { useMemo, useState } from 'react';
import { Globe, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import RegionalAggregateChart from '@/components/dashboard/RegionalAggregateChart';
import ClimateRiskToggle from '@/components/dashboard/ClimateRiskToggle';
import CountryCard from '@/components/shared/CountryCard';
import { useCountries } from '@/components/shared/useCountries';
import { formatNumber } from '@/components/dashboard/constants';
import type { ClimateRiskType, CountryStats } from '@/components/dashboard/types';

const CASE_STUDY_NARRATIVES: Record<string, string> = {
  BGD:
    'Low-lying districts across the Ganges-Brahmaputra delta combine extreme flood exposure with high poverty rates and limited sewerage coverage outside Dhaka.',
  PHL:
    'Coastal and riverine districts in Mindanao and the Visayas show how typhoon-driven flood risk layers onto persistent poverty and uneven sanitation access.',
  NGA:
    'Rapidly urbanising districts in the Niger delta and northern states combine the highest poverty concentrations in the dataset with widespread sanitation gaps.',
};

const CASE_STUDY_ORDER = ['BGD', 'PHL', 'NGA'];

function Loading() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--climate-teal)] border-t-transparent" />
    </div>
  );
}

export default function ResultsSections() {
  const { countries, loading } = useCountries();
  const [risk, setRisk] = useState<ClimateRiskType>('flood');

  const totals = useMemo(() => {
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

  const caseStudyCountries = useMemo<CountryStats[]>(() => {
    const map = new Map(countries.map((c) => [c.iso3.toUpperCase(), c] as const));
    return CASE_STUDY_ORDER
      .map((iso) => map.get(iso))
      .filter((v): v is CountryStats => !!v);
  }, [countries]);

  if (loading) return <Loading />;

  const share = (n: number) => (totals.pop > 0 ? (n / totals.pop) * 100 : 0);

  return (
    <div className="space-y-16">
      {/* Global impact */}
      <section>
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold">Global impact</h2>
          <span className="text-sm text-gray-500">
            Aggregated across {countries.length.toLocaleString()} countries
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div
            className="bg-white p-8 rounded-xl shadow-lg border-l-4"
            style={{ borderColor: 'var(--climate-teal)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8" style={{ color: 'var(--climate-teal)' }} />
              <h3 className="text-2xl font-bold">Water stress scenario</h3>
            </div>
            <div className="text-5xl font-bold mb-4 tabular-nums" style={{ color: 'var(--climate-teal)' }}>
              {formatNumber(totals.tbWater)}
            </div>
            <p className="text-gray-700 mb-4 tabular-nums">
              people ({share(totals.tbWater).toFixed(1)}% of urban population in the dataset) face
              all three burdens simultaneously.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Water stress as climate driver</p>
            </div>
          </div>

          <div
            className="bg-white p-8 rounded-xl shadow-lg border-l-4"
            style={{ borderColor: 'var(--sanitation-blue)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8" style={{ color: 'var(--sanitation-blue)' }} />
              <h3 className="text-2xl font-bold">Flood risk scenario</h3>
            </div>
            <div className="text-5xl font-bold mb-4 tabular-nums" style={{ color: 'var(--sanitation-blue)' }}>
              {formatNumber(totals.tbFlood)}
            </div>
            <p className="text-gray-700 mb-4 tabular-nums">
              people ({share(totals.tbFlood).toFixed(1)}% of urban population) are affected when
              flooding is the climate driver.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Flood risk as climate driver</p>
            </div>
          </div>
        </div>
      </section>

      {/* Regional breakdown */}
      <section>
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--climate-teal)] to-[var(--sanitation-blue)] text-white">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold">Regional breakdown</h2>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs">
            <ClimateRiskToggle value={risk} onChange={setRisk} label="Scenario" />
          </div>
        </div>
        <RegionalAggregateChart
          countries={countries}
          climateRiskType={risk}
          subtitle="Click a case study below to drill into country-level profiles"
        />
      </section>

      {/* Case studies */}
      <section>
        <h2 className="text-3xl font-bold mb-3">Country case studies</h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          Three countries illustrate how the burden plays out differently depending on climate
          drivers, income level, and urbanisation patterns.
        </p>
        {caseStudyCountries.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudyCountries.map((c) => (
              <CountryCard
                key={c.iso3}
                country={c}
                climateRiskType={risk}
                narrative={CASE_STUDY_NARRATIVES[c.iso3.toUpperCase()] ?? ''}
                variant="full"
                href={`/dashboard?country=${c.iso3.toUpperCase()}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Case study data could not be loaded.</p>
        )}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--climate-teal)] font-semibold hover:underline"
          >
            Explore all {countries.length.toLocaleString()} countries in the dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
