'use client';

import type { ClimateRiskType } from './types';

interface Props {
  value: ClimateRiskType;
  onChange: (v: ClimateRiskType) => void;
  label?: string;
}

export default function ClimateRiskToggle({ value, onChange, label = 'Climate risk scenario' }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex bg-gray-100 rounded-xl p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={value === 'flood'}
          onClick={() => onChange('flood')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            value === 'flood'
              ? 'bg-white shadow text-[var(--sanitation-blue)]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Flood risk
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={value === 'water_stress'}
          onClick={() => onChange('water_stress')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            value === 'water_stress'
              ? 'bg-white shadow text-[var(--climate-teal)]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Water stress
        </button>
      </div>
    </div>
  );
}
