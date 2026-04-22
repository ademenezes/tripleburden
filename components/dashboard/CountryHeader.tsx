'use client';

import { Download } from 'lucide-react';
import { formatNumber, regionLabels, incomeGroupLabels } from './constants';
import type { CountryStats, ClimateRiskType, GeoJSONData } from './types';

interface Props {
  country: CountryStats;
  climateRiskType: ClimateRiskType;
  geoData: GeoJSONData | null;
  tripleBurdenDistricts: number;
}

function downloadCSV(country: CountryStats, geo: GeoJSONData) {
  const headers = [
    'Region', 'District', 'Population', 'Urban Share (%)',
    'Poverty Rate ($2.15)', 'Poverty Rate ($3.65)', 'Poverty Rate ($6.85)',
    'Flood Risk (%)', 'Water Stress Category',
    'Improved Sanitation (%)', 'Sewer/Septic (%)', 'Improved Water (%)',
    'WB Region', 'Income Group',
    'Poverty Flag', 'Flood Flag', 'Water Stress Flag', 'Low Sanitation Flag',
    'Triple Burden (Flood)', 'Triple Burden (Water Stress)',
  ];
  const rows = geo.features.map((f) => [
    f.properties.nam1 || '',
    f.properties.nam2 || '',
    f.properties.popdist?.toFixed(0) || '',
    f.properties.shrurb?.toFixed(2) || '',
    f.properties.p215ln?.toFixed(2) || '',
    f.properties.p365ln?.toFixed(2) || '',
    f.properties.p685ln?.toFixed(2) || '',
    f.properties.shpopfld?.toFixed(2) || '',
    f.properties.bws_cat?.toString() || '',
    f.properties.impsan?.toFixed(2) || '',
    f.properties.sewlat?.toFixed(2) || '',
    f.properties.impwat?.toFixed(2) || '',
    f.properties.reg1 || '',
    f.properties.incgrp || '',
    f.properties.d_pov?.toString() || '',
    f.properties.d_fld?.toString() || '',
    f.properties.d_wtrstr?.toString() || '',
    f.properties.d_lowsan?.toString() || '',
    f.properties.tb_fld?.toString() || '',
    f.properties.tb_wtrstr?.toString() || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${country.iso3}_triple_burden_data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CountryHeader({
  country,
  climateRiskType,
  geoData,
  tripleBurdenDistricts,
}: Props) {
  const scenarioLabel = climateRiskType === 'flood' ? 'flood scenario' : 'water-stress scenario';
  return (
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2">
      <div>
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--climate-teal)] mb-2">
          Country profile · {scenarioLabel}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{country.name}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-600">
          {country.region && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--climate-teal)]/10 text-[var(--climate-teal)] font-medium">
              {regionLabels[country.region] ?? country.region}
            </span>
          )}
          {country.income_group && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--sanitation-blue)]/10 text-[var(--sanitation-blue)] font-medium">
              {incomeGroupLabels[country.income_group] ?? country.income_group}
            </span>
          )}
          <span>
            <strong className="text-gray-900">{country.districts.toLocaleString()}</strong> districts
          </span>
          <span>
            <strong className="text-gray-900">{formatNumber(country.population)}</strong> urban pop.
          </span>
          <span>
            <strong className="text-[var(--accent-danger)]">{tripleBurdenDistricts.toLocaleString()}</strong> triple-burdened
          </span>
        </div>
      </div>
      {geoData && (
        <button
          type="button"
          onClick={() => downloadCSV(country, geoData)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] text-white rounded-lg font-medium hover:shadow-lg transition-shadow self-start lg:self-end"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      )}
    </header>
  );
}
