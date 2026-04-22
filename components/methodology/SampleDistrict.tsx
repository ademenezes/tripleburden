'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { BASE_PATH, THRESHOLDS } from '@/components/dashboard/constants';
import type { DistrictFeature, GeoJSONData } from '@/components/dashboard/types';

interface Props {
  iso3?: string;
}

interface Metric {
  label: string;
  value: number;
  threshold: number;
  comparator: '>=' | '<=';
  unit: string;
  color: string;
}

export default function SampleDistrict({ iso3 = 'bgd' }: Props) {
  const [district, setDistrict] = useState<DistrictFeature | null>(null);
  const [countryName, setCountryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/data/districts/${iso3.toLowerCase()}.json`)
      .then((r) => r.json() as Promise<GeoJSONData>)
      .then((data) => {
        if (cancelled) return;
        // Pick a district at burden level 3 with the highest population.
        const candidates = data.features.filter((f) => f.properties.tb_fld === 3);
        candidates.sort((a, b) => (b.properties.popdist || 0) - (a.properties.popdist || 0));
        setDistrict(candidates[0] ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    fetch(`${BASE_PATH}/data/countries.json`)
      .then((r) => r.json())
      .then((countries: Array<{ iso3: string; name: string }>) => {
        if (cancelled) return;
        const match = countries.find((c) => c.iso3.toUpperCase() === iso3.toUpperCase());
        if (match) setCountryName(match.name);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [iso3]);

  const metrics = useMemo<Metric[]>(() => {
    if (!district) return [];
    const p = district.properties;
    return [
      {
        label: 'Poverty rate ($3.65/day)',
        value: p.p365ln,
        threshold: THRESHOLDS.povertyPct,
        comparator: '>=',
        unit: '%',
        color: 'var(--poverty-earth)',
      },
      {
        label: 'Flood risk (% pop.)',
        value: p.shpopfld,
        threshold: THRESHOLDS.floodPct,
        comparator: '>=',
        unit: '%',
        color: 'var(--climate-teal)',
      },
      {
        label: 'Sewer/septic access',
        value: p.sewlat,
        threshold: THRESHOLDS.sanitationPct,
        comparator: '<=',
        unit: '%',
        color: 'var(--sanitation-blue)',
      },
    ];
  }, [district]);

  if (loading) {
    return (
      <div className="modern-card p-6 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--climate-teal)] border-t-transparent" />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="modern-card p-6 text-sm text-gray-500">
        Could not find a sample district for {iso3.toUpperCase()}.
      </div>
    );
  }

  return (
    <div className="modern-card p-6 bg-gradient-to-br from-white to-teal-50/30">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--climate-teal)] mb-1">
            Sample district
          </div>
          <h4 className="text-xl font-bold">
            {district.properties.nam2}
            <span className="text-gray-500 font-normal">
              {' '}
              · {district.properties.nam1}
            </span>
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {countryName || iso3.toUpperCase()} · burden level 3 (all three criteria met)
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-danger-soft)] text-[var(--accent-danger)] font-semibold">
          Triple-burdened
        </span>
      </div>

      <div className="space-y-3">
        {metrics.map((m) => {
          const meets =
            m.comparator === '>=' ? m.value >= m.threshold : m.value <= m.threshold;
          const barPct = Math.max(0, Math.min(100, m.value));
          const thresholdPct = Math.max(0, Math.min(100, m.threshold));
          return (
            <div key={m.label}>
              <div className="flex items-baseline justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-semibold" style={{ color: m.color }}>
                    {m.value?.toFixed(1) ?? '—'}
                    {m.unit}
                  </span>
                  {meets && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-danger-soft)] text-[var(--accent-danger)]">
                      <Check className="w-3 h-3" /> flagged
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-visible">
                <div
                  className="absolute h-full rounded-full transition-all duration-500"
                  style={{ width: `${barPct}%`, backgroundColor: m.color, opacity: meets ? 1 : 0.35 }}
                />
                <div
                  className="absolute top-[-3px] bottom-[-3px] w-[2px]"
                  style={{ left: `${thresholdPct}%`, backgroundColor: m.color }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">
                Threshold: {m.comparator} {m.threshold}
                {m.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
