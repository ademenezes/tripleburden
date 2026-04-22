'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BASE_PATH } from './constants';
import type {
  ClimateRiskType,
  CountryStats,
  DistrictFeature,
  GeoJSONData,
  SummaryStats,
} from './types';

const VALID_RISK: ClimateRiskType[] = ['flood', 'water_stress'];

export function useDashboardState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countries, setCountries] = useState<CountryStats[]>([]);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // URL-derived state
  const countryParam = searchParams.get('country')?.toUpperCase() ?? null;
  const riskParam = searchParams.get('risk') ?? 'flood';
  const climateRiskType: ClimateRiskType = VALID_RISK.includes(riskParam as ClimateRiskType)
    ? (riskParam as ClimateRiskType)
    : 'flood';

  const selectedCountry = useMemo(() => {
    if (!countryParam) return null;
    return countries.find((c) => c.iso3.toUpperCase() === countryParam) ?? null;
  }, [countries, countryParam]);

  const setSelectedCountry = useCallback(
    (country: CountryStats | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (country) {
        params.set('country', country.iso3.toUpperCase());
      } else {
        params.delete('country');
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  const setClimateRiskType = useCallback(
    (risk: ClimateRiskType) => {
      const params = new URLSearchParams(searchParams.toString());
      if (risk === 'flood') {
        params.delete('risk');
      } else {
        params.set('risk', risk);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  // Load country index on mount.
  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/data/countries.json`)
      .then((res) => res.json())
      .then((data: CountryStats[]) => {
        if (cancelled) return;
        setCountries(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load countries:', err);
        setLoadError('Failed to load country index.');
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load per-country GeoJSON whenever the selection changes.
  useEffect(() => {
    if (!selectedCountry) {
      setGeoData(null);
      return;
    }
    let cancelled = false;
    setIsLoadingMap(true);
    fetch(`${BASE_PATH}/data/districts/${selectedCountry.iso3.toLowerCase()}.json`)
      .then((res) => res.json())
      .then((data: GeoJSONData) => {
        if (cancelled) return;
        setGeoData(data);
        setIsLoadingMap(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load district data:', err);
        setIsLoadingMap(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCountry]);

  // Summary stats per burden level × combo for the selected country.
  const summaryStats = useMemo<SummaryStats | null>(() => {
    if (!geoData) return null;

    const distribution: SummaryStats['distribution'] = {
      0: { count: 0, population: 0, combos: {} },
      1: { count: 0, population: 0, combos: {} },
      2: { count: 0, population: 0, combos: {} },
      3: { count: 0, population: 0, combos: {} },
    };

    let totalPop = 0;
    let missingData = 0;
    let povCount = 0;
    let climCount = 0;
    let sanCount = 0;
    const regionPop: Record<string, number> = {};

    geoData.features.forEach((f: DistrictFeature) => {
      const p = f.properties;
      const pov = p.d_pov;
      const climate = climateRiskType === 'flood' ? p.d_fld : p.d_wtrstr;
      const san = p.d_lowsan;
      const pop = p.popdist || 0;
      totalPop += pop;

      const dims = [pov, climate, san];
      if (!dims.every((v) => v === 0 || v === 1)) {
        missingData++;
        return;
      }
      if (pov === 1) povCount++;
      if (climate === 1) climCount++;
      if (san === 1) sanCount++;

      const level = (pov as number) + (climate as number) + (san as number);
      const comboParts: string[] = [];
      if (pov === 1) comboParts.push('P');
      if (climate === 1) comboParts.push('C');
      if (san === 1) comboParts.push('S');
      const combo = comboParts.join('+') || 'None';

      distribution[level].count++;
      distribution[level].population += pop;
      if (!distribution[level].combos[combo]) {
        distribution[level].combos[combo] = { count: 0, population: 0 };
      }
      distribution[level].combos[combo].count++;
      distribution[level].combos[combo].population += pop;

      if (level === 3 && p.nam1) {
        regionPop[p.nam1] = (regionPop[p.nam1] ?? 0) + pop;
      }
    });

    const dominantRegion =
      Object.entries(regionPop).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const counts: Array<['P' | 'C' | 'S', number]> = [
      ['P', povCount],
      ['C', climCount],
      ['S', sanCount],
    ];
    const dominantDimension = counts.sort((a, b) => b[1] - a[1])[0]?.[1] > 0
      ? counts.sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      distribution,
      totalPop,
      missingData,
      dominantRegion,
      dominantDimension,
    };
  }, [geoData, climateRiskType]);

  return {
    // data
    countries,
    selectedCountry,
    geoData,
    summaryStats,
    climateRiskType,
    // status
    isLoading,
    isLoadingMap,
    loadError,
    // setters
    setSelectedCountry,
    setClimateRiskType,
  };
}
