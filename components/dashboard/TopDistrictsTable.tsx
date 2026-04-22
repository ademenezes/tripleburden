'use client';

import { useMemo } from 'react';
import { burdenColors, burdenLabels, formatNumber } from './constants';
import type { ClimateRiskType, DistrictFeature, GeoJSONData } from './types';

interface Props {
  geoData: GeoJSONData;
  climateRiskType: ClimateRiskType;
}

interface Row {
  id: number;
  nam1: string;
  nam2: string;
  popdist: number;
  level: number;
  flags: { P: boolean; C: boolean; S: boolean };
}

function dimensionBadge(active: boolean, letter: 'P' | 'C' | 'S', color: string) {
  return (
    <span
      key={letter}
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
        active ? 'text-white' : 'bg-gray-100 text-gray-400'
      }`}
      style={active ? { backgroundColor: color } : {}}
      title={letter === 'P' ? 'Poverty' : letter === 'C' ? 'Climate' : 'Low sanitation'}
    >
      {letter}
    </span>
  );
}

export default function TopDistrictsTable({ geoData, climateRiskType }: Props) {
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const f of geoData.features) {
      const p = f.properties;
      const climate = climateRiskType === 'flood' ? p.d_fld : p.d_wtrstr;
      if (p.d_pov == null || climate == null || p.d_lowsan == null) continue;
      const level = (p.d_pov as number) + (climate as number) + (p.d_lowsan as number);
      if (level < 2) continue;
      out.push({
        id: p.mundis_id,
        nam1: p.nam1 || '',
        nam2: p.nam2 || '(unknown)',
        popdist: p.popdist || 0,
        level,
        flags: {
          P: p.d_pov === 1,
          C: climate === 1,
          S: p.d_lowsan === 1,
        },
      });
    }
    out.sort((a, b) => b.level - a.level || b.popdist - a.popdist);
    return out.slice(0, 10);
  }, [geoData, climateRiskType]);

  if (rows.length === 0) {
    return (
      <div className="modern-card p-6">
        <h3 className="text-lg font-bold mb-1">Most-affected districts</h3>
        <p className="text-sm text-gray-500">No districts at burden level 2 or above in this country.</p>
      </div>
    );
  }

  const maxPop = Math.max(...rows.map((r) => r.popdist), 1);

  return (
    <div className="modern-card p-6">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold">Most-affected districts</h3>
        <span className="text-xs text-gray-500">
          Ranked by burden level, then population
        </span>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const widthPct = Math.max(2, (r.popdist / maxPop) * 100);
          const color = burdenColors[r.level];
          return (
            <div key={r.id || i} className="group">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 text-xs text-gray-400 tabular-nums text-right flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate">
                      <span className="font-medium">{r.nam2}</span>
                      {r.nam1 && <span className="text-gray-500 text-xs ml-1">· {r.nam1}</span>}
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">
                      {formatNumber(r.popdist)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {dimensionBadge(r.flags.P, 'P', 'var(--poverty-earth)')}
                      {dimensionBadge(r.flags.C, 'C', 'var(--climate-teal)')}
                      {dimensionBadge(r.flags.S, 'S', 'var(--sanitation-blue)')}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
                      style={{
                        backgroundColor: color,
                        color: r.level === 3 ? 'white' : 'inherit',
                      }}
                    >
                      {burdenLabels[r.level]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
